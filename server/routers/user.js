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

    router.get('/:stdid', (req, res) => {
        let visiting = false
        if (req.session.stdid) {
            if (req.session.stdid == req.params.stdid) {
                extract(req.params.stdid).then(student => {
                    res.render('user-profile', { student: student[0], visiting: visiting })
                })
            } else {
                extract(req.params.stdid).then(student => {
                    visiting = true
                    res.render('user-profile', { student: student[0], visiting: visiting })
                }).catch(err => {
                    io.emit('no-studentid', `/user/${req.session.stdid}`)
                }) 
            }
        } else {
            res.redirect('/login')
        }
    })
    return router
}

module.exports = userRouter