import { Router } from 'express'
import { Convert, getProfile } from '../services/userService.js'
import { getNotifications, getSavedNotes, unreadNotiCount } from '../helpers/rootInfo.js'
import { Server } from 'socket.io'
import { log } from '../helpers/utils.js'

const router = Router()

function userRouter(io: Server) {
    router.get('/:username?', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"]
            if (!studentID) return res.redirect('/login')
            
            let rootUsername = await Convert.getUserName_studentid(req.session["stdid"])

            if (req.params.username) {
                let [notis, unReadCount, rootProfile, savedNotes] = await Promise.all([
                    getNotifications(req.session["stdid"]),
                    unreadNotiCount(req.session["stdid"]),
                    getProfile(req.session["stdid"]),
                    getSavedNotes(req.session["stdid"])
                ])
                log('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Got root-user information`)

                let profileData = null
                let isOwnProfile = rootUsername === req.params.username

                if (isOwnProfile) {
                    profileData = rootProfile["_student"]
                    log('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Visiting own profile`)
                } else {
                    let visitedStudentID = await Convert.getStudentID_username(req.params.username)
                    if (!visitedStudentID) {
                        const error = new Error(`No students found for username: ${req.params.username}`)
                        error["status"] = 404
                        log('error', `On /user Username=${req.params.username || "--username--"}: Couldn't get user data: ${error.message}`)
                        return next(error)
                    }
                    profileData = (await getProfile(visitedStudentID))["_student"]
                    log('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Visiting ${visitedStudentID} profile`)
                }
                let { badges: badge, owned_notes: notes, ...student } = profileData
                log('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Prepared the profile information`)

                res.render('user-profile', { 
                    student: student, notes: notes, badge: badge[0],
                    savedNotes: savedNotes, notis: notis, root: rootProfile["_student"], unReadCount: unReadCount, 
                    visiting: !isOwnProfile
                })
                log('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Rendered the profile successfully`)

            } else {
                res.redirect(`/user/${rootUsername}`)
            }
        } catch (err) {
            log('error', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Error on user profile request processing: ${err.message}`)
            next(new Error("Sorry! Cannot get the user profile. Try again a bit later"))
        }
    })

    return router
}

export default userRouter
