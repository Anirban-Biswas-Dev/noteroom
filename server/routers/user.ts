import { Router } from 'express'
import { Convert, getProfile } from '../services/userService.js'
import { getNotifications, getSavedNotes, unreadNotiCount } from '../helpers/rootInfo.js'
import { Server } from 'socket.io'
import { log } from '../helpers/utils.js'

const router = Router()

function userRouter(io: Server) {
    router.get('/:username?', async (req, res, next) => {
        if (req.params.username) {
            if (req.session["stdid"]) {
                let username = await Convert.getUserName_studentid(req.session["stdid"])
                let notis = await getNotifications(req.session["stdid"]) // Notifications of the root-user
                let unReadCount = await unreadNotiCount(req.session["stdid"])
                let data = await getProfile(req.session["stdid"])
                let savedNotes = await getSavedNotes(req.session["stdid"])                    

                if (username == req.params.username) {
                    try {
                        let { badges: badge, owned_notes: notes, ...student } = data["_student"]
                        res.render('user-profile', { student: student, notes: notes, savedNotes: savedNotes, visiting: false, notis: notis, root: student, unReadCount: unReadCount, badge: badge[0] })
                    } catch (error) {
                        next(error)
                    }
                } else {
                    try {
                        let userStudentID = await Convert.getStudentID_username(req.params.username)
                        let visitedStudent = await getProfile(userStudentID)
                        let { badges: badge, owned_notes: notes, ...student } = visitedStudent["_student"]

                        res.render('user-profile', { student: student, notes: notes, savedNotes: savedNotes, visiting: true, notis: notis, root: data["_student"], unReadCount: unReadCount, badge: badge[0] })
                    } catch (err) {
                        const error = new Error(`No students found for username: ${req.params.username}`)
                        error["status"] = 404
                        log('error', `On /user Username=${req.params.username || "--username--"}: Couldn't get user data`)
                        next(error)
                    }
                }
            } else {
                res.redirect('/login')
            }
        } else {
            if (req.session["stdid"]) {
                let username = await Convert.getUserName_studentid(req.session["stdid"])
                res.redirect(`/user/${username}`)
            } else {
                res.redirect('/login')
            }
        }
    })

    return router
}

export default userRouter
