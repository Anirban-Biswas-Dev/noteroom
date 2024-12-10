const express = require('express')
const router = express.Router()
const Students = require('../schemas/students')
const allNotifs = require('../schemas/notifications').Notifs
const Notes = require('../schemas/notes')
const { getSavedNotes, getNotifications, unreadNotiCount } = require('./controller')

function userRouter(io) {
    /*
    # Variables:
        => studentID: The student-id given by the student while signing-up
        => student: This has 2 different meaning
        ~   1. When visiting someone else's profile, student variable holds the data if the visited profile's
        ~   2. When visiting my own profile, student variable holds the data of the student's own profile
        => root: This always indicates the self-profile, meaning the profile data of the logged-in user
    */

    async function extract(studentID) {
        let student = await Students.findOne({ studentID: studentID })
        let students_notes_ids = student['owned_notes'] // owned notes list
        let notes;
        if (students_notes_ids.length != 0) {
            notes = await Notes.find({ _id: { $in: students_notes_ids } })
        } else {
            notes = 0
        }
        return new Promise((resolve, reject) => {
            if ((student.length != 0)) {
                resolve({ student: student, notes: notes })
            } else {
                reject('No students found!')
            }
        })
    }

    async function getUserName(studentID) {
        let username = (await Students.findOne({ studentID: studentID }, { username: 1 }))["username"]
        return username
    }
    async function getStudentID(username) {
        let studentID = (await Students.findOne({ username: username }, { studentID: 1 }))["studentID"]
        return studentID
    }

    router.get('/:username?', async (req, res, next) => {
        if (req.params.username) {
            if (req.session.stdid) {
                let username = await getUserName(req.session.stdid)
                let notis = await getNotifications(allNotifs, req.session.stdid) // Notifications of the root-user
                let unReadCount = await unreadNotiCount(allNotifs, req.session.stdid)

                if (username == req.params.username) {
                    try {
                        let data = await extract(req.session.stdid)
                        let [student, notes] = [data['student'], data['notes']]
                        let savedNotes = await getSavedNotes(Students, Notes, req.session.stdid)
                        res.render('user-profile', { student: student, notes: notes, savedNotes: savedNotes, visiting: false, notis: notis, root: student, unReadCount: unReadCount })
                    } catch (error) {
                        next(error)
                    }
                } else {
                    try {
                        let userStudentID = await getStudentID(req.params.username)
                        let data = await extract(userStudentID)
                        let [student, notes] = [data['student'], data['notes']] // This is the student-data whose profile is being visited
                        let savedNotes = await getSavedNotes(Students, Notes, req.session.stdid)
                        let root = (await extract(req.session.stdid))['student']
                        res.render('user-profile', { student: student, notes: notes, savedNotes: savedNotes, visiting: true, notis: notis, root: root, unReadCount: unReadCount })
                    } catch (err) {
                        req.studentID = req.params.username
                        const error = new Error('No students found')
                        error.status = 404
                        error.errorID = 1000 // An error id of 'student not found'
                        next(error)
                    }
                }
            } else {
                res.redirect('/login')
            }
        } else {
            if (req.session.stdid) {
                let username = await getUserName(req.session.stdid)
                res.redirect(`user/${username}`)
            } else {
                res.redirect('/login')
            }
        }
    })

    return router
}

module.exports = userRouter
