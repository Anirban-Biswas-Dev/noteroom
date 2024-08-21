const express = require('express')
const Students = require('../schemas/students')
const router = express.Router()

function loginRouter(io) {
    async function extract(studentID) {
        let student = await Students.findOne({ studentid: studentID })
        return new Promise((resolve, reject) => {
            if (student.length != 0) {
                resolve({ studentPass: student["password"], recordID: student["_id" ] })
            } else {
                reject('No students found!')
            }
        })
    }

    router.get('/', (req, res) => {
        if(req.session.stdid) {
            res.redirect(`/user/${req.session.stdid}`)
        } else {
            res.status(200)
            res.render('login')
        }
    })

    router.post('/', (req, res) => {
        let studentid = req.body.studentid
        let password = req.body.password

        extract(studentid).then(student => {
            if (password === student['studentPass']) {
                req.session.stdid = studentid // setting the session with the student ID
                res.cookie('recordID', student['recordID']) // setting a cookie with a value of the document ID of the user
                res.redirect(`/user/${req.session.stdid}`)
            } else {
                io.emit('wrong-cred')
            }
        }).catch(err => {
            io.emit('no-studentid')
        })
    })
    
    return router
}

module.exports = loginRouter
