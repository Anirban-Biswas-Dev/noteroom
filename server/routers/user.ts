import { Router } from 'express'
import { Convert, getProfile } from '../services/userService.js'
import { getNotifications, getSavedNotes, unreadNotiCount } from '../helpers/rootInfo.js'
import { Server } from 'socket.io'
import { manageProfileNotes } from '../services/noteService.js'
import { log } from '../helpers/utils.js'

const router = Router()

function userRouter(io: Server) {
    router.get('/:username?', async (req, res, next) => {
        if (req.params.username) {
            if (req.session["stdid"]) {
                let username = await Convert.getUserName_studentid(req.session["stdid"])
                let notis = await getNotifications(req.session["stdid"]) // Notifications of the root-user
                let unReadCount = await unreadNotiCount(req.session["stdid"])
                let noteCounts = [
                    await manageProfileNotes.getNoteCount('owned', req.session["stdid"]),
                    await manageProfileNotes.getNoteCount('saved', req.session["stdid"])
                ]

                if (username == req.params.username) {
                    try {
                        let data = await getProfile(req.session["stdid"])
                        let [student, notes] = [data['student'], data['notes']]
                        let savedNotes = await getSavedNotes(req.session["stdid"])
                        res.render('user-profile', { noteCounts: noteCounts, student: student, notes: notes, savedNotes: savedNotes, visiting: false, notis: notis, root: student, unReadCount: unReadCount })
                    } catch (error) {
                        next(error)
                    }
                } else {
                    try {
                        let userStudentID = await Convert.getStudentID_username(req.params.username)
                        let data = await getProfile(userStudentID)
                        let [student, notes] = [data['student'], data['notes']] // This is the student-data whose profile is being visited
                        let savedNotes = await getSavedNotes(req.session["stdid"])
                        let root = (await getProfile(req.session["stdid"]))['student']
                        res.render('user-profile', { student: student, notes: notes, savedNotes: savedNotes, visiting: true, notis: notis, root: root, unReadCount: unReadCount })
                    } catch (err) {
                        req["studentID"] = req.params.username
                        const error = new Error('No students found')
                        error["status"] = 404
                        error["errorID"] = 1000 // An error id of 'student not found'
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
