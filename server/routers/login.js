const express = require('express')
const Students = require('../schemas/students')
const router = express.Router()

/* 
# Cookies:
    => stdid: session cookie generated with studentID
    => recordID: student's studentDocID
    => recordName: student's username
*/

function loginRouter(io) {
    async function extract(studentid) {
        let student = await Students.findOne({ studentID: studentid })
        return new Promise((resolve, reject) => {
            if (student.length != 0) {
                resolve({ studentPass: student["password"], recordID: student["_id" ], recordName: student["username"] })
            } else {
                reject('No students found!')
            }
        })
    }

    router.get('/', (req, res) => {
        if(req.session.stdid) {
            res.redirect('dashboard')
        } else {
            res.status(200)
            res.render('login')
        }
    })

    router.post('/', async (req, res) => {
        try {
            let studentID = req.body.studentID
            let password = req.body.password

            let student = await extract(studentID)
            if (password === student['studentPass']) {
                req.session.stdid = studentID // setting the session with the student ID
                res.cookie('recordID', student['recordID']) // setting a cookie with a value of the document ID of the user
                res.cookie('recordName', student['recordName']) // setting a cookie with a value of the username of the user
                res.json({ url: '/dashboard' })
            } else {
                res.json({ message: 'wrong-cred' })
                io.emit('wrong-cred')
            }
        } catch (error) {
            console.log(error.message)
            res.json({ message: 'no-studentid' })
            io.emit('no-studentid')
        }
    })
    
    return router
}

module.exports = loginRouter
