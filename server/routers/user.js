const express = require('express')
const router = express.Router()
const Students = require('../schemas/students')

function userRouter(io) {
    async function extract(studentID) {
        let student = await Students.find({ student_id: studentID })
        return new Promise((resolve, reject) => {
            if (student.length != 0) {
                resolve(student)
            } else {
                reject('No students found!')
            }
        })
    }

    router.get('/:stdid', (req, res, next) => {
        let visiting = false
        if (req.session.stdid) {
            if (req.session.stdid == req.params.stdid) {
                extract(req.params.stdid).then(student => {
                    res.render('user-profile', { student: student[0], visiting: visiting })
                }).catch(err => {
                    next(err)
                })
            } else {
                extract(req.params.stdid).then(student => {
                    visiting = true
                    res.render('user-profile', { student: student[0], visiting: visiting })
                }).catch(err => {
                    req.studentID = req.params.stdid // Passing the studentID to the next middleware (error handler) to use that in the error page
                    const error = new Error('No students found')
                    error.status = 404
                    error.errorID = 1000 // An error id of 'student not found'
                    next(error)
                })
            }
        } else {
            res.redirect('/login')
        }
    })
    return router
}

module.exports = userRouter