const express = require('express')
const router = express.Router()
const Students = require('../schemas/students')
const Notes = require('../schemas/notes')

function userRouter(io) {
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

    // This route fetches saved notes for the user profile page
    async function getSavedNotes(studentID) {
        let student = await Students.findOne({ studentID: studentID }, { saved_notes: 1 })
        let saved_notes_ids = student['saved_notes']
        let notes;
        if (saved_notes_ids.length != 0) {
            notes = await Notes.find({ _id: { $in: saved_notes_ids } })
        } else {
            notes = 0
        }
        return notes
    }

    router.get('/:stdid?', (req, res, next) => {
        if (req.params.stdid) {
            let visiting = false
            if (req.session.stdid) {
                if (req.session.stdid == req.params.stdid) {
                    extract(req.params.stdid).then(data => {
                        let student = data['student']
                        let notes = data['notes']
                        // Fetching saved notes here
                        getSavedNotes(req.params.stdid).then(savedNotes => {
                            res.render('user-profile', { student: student, notes: notes, savedNotes: savedNotes, visiting: visiting })
                        })
                    }).catch(err => {
                        next(err)
                    })
                } else {
                    extract(req.params.stdid).then(data => {
                        let student = data['student']
                        let notes = data['notes']
                        visiting = true
                        // Fetching saved notes here
                        getSavedNotes(req.params.stdid).then(savedNotes => {
                            res.render('user-profile', { student: student, notes: notes, savedNotes: savedNotes, visiting: visiting })
                        })
                    }).catch(err => {
                        req.studentID = req.params.stdid
                        const error = new Error('No students found')
                        error.status = 404
                        error.errorID = 1000 // An error id of 'student not found'
                        next(error)
                    })
                }
            } else {
                res.redirect('/login')
            }
        } else {
            if (req.session.stdid) {
                res.redirect(`user/${req.session.stdid}`)
            } else {
                res.redirect('/login')
            }
        }
    })
    return router
}

module.exports = userRouter
