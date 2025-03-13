import { Router } from 'express'
import { Convert, getProfile } from '../services/userService.js'
import { getNotifications, getSavedNotes, unreadNotiCount } from '../helpers/rootInfo.js'
import { Server } from 'socket.io'
import { log } from '../helpers/utils.js'

const router = Router()

function userRouter(io: Server) {
    router.get('/:username?', async (req, res, next) => {
        // try {
        //     "9181e241-575c-4ef3-9d3c-2150eac4566d"

        //     let studentID = req.session["stdid"]
        //     if (!studentID) return res.redirect('/login')
            
        //     let rootUsername = await Convert.getUserName_studentid(req.session["stdid"])

        //     if (req.params.username) {
        //         let [notis, unReadCount, rootProfile, savedNotes] = await Promise.all([
        //             getNotifications(req.session["stdid"]),
        //             unreadNotiCount(req.session["stdid"]),
        //             getProfile(req.session["stdid"]),
        //             getSavedNotes(req.session["stdid"])
        //         ])

        //         let profileData = null
        //         let isOwnProfile = rootUsername === req.params.username

        //         if (isOwnProfile) {
        //             profileData = rootProfile["_student"]
        //         } else {
        //             let visitedStudentID = await Convert.getStudentID_username(req.params.username)
        //             if (!visitedStudentID) {
        //                 const error = new Error(`No students found for username: ${req.params.username}`)
        //                 error["status"] = 404
        //                 log('error', `On /user Username=${req.params.username || "--username--"}: Couldn't get user data: ${error.message}`)
        //                 return next(error)
        //             }
        //             profileData = (await getProfile(visitedStudentID))["_student"]
        //         }
        //         let { badges: badge, owned_notes: notes, ...student } = profileData

        //         res.render('user-profile', { 
        //             student: student, notes: notes, badge: badge[0],
        //             savedNotes: savedNotes, notis: notis, root: rootProfile["_student"], unReadCount: unReadCount, 
        //             visiting: !isOwnProfile
        //         })

        //     } else {
        //         res.redirect(`/user/${rootUsername}`)
        //     }
        // } catch (err) {
        //     next(new Error("Sorry! Cannot get the user profile. Try again a bit later"))
        // }
        try {
            if(req.params.username) {
                let username = req.params.username

                let visiterStudentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
                let profileStudentID = await Convert.getStudentID_username(username)

                let profile = await getProfile(username)
                if (profile.ok) {
                    res.json({ ok: true, profile: {...profile.student, owner: visiterStudentID === profileStudentID } })
                } else {
                    //TODO: manage unknown user profile
                    res.json({ ok: false, message: "Sorry, nobody on NoteRoom goes by that name." })
                }
            } else {
                //TODO: 404 page not found general page creation
                res.json({ ok: false, message: "Page not found!" })
            }
        } catch (error) {
            console.log(error)
        }
    })

    return router
}

export default userRouter
