const express = require('express')
const Students = require('../schemas/students')
const router = express.Router()

/* 
# Cookies:
    => stdid: session cookie generated with studentID
    => recordID: student's studentDocID
*/

function loginRouter(io) {
    async function extractLogin(email) {
        let student = await Students.findOne({ email: email })
        return new Promise((resolve, reject) => {
            if (student) {
                resolve({ 
                    studentPass: student["password"], 
                    recordID: student["_id" ], 
                    studentID: student["studentID"]
                })
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
            let email = req.body.email
            let password = req.body.password

            let student = await extractLogin(email)
            if (password === student['studentPass']) {
                req.session.stdid = student["studentID"] // setting the session with the student ID
                res.cookie('recordID', student['recordID']) // setting a cookie with a value of the document ID of the user
                res.cookie('studentID', student['studentID']) // setting a cookie with a value of the student ID
                res.json({ url: '/dashboard' })
                // res.json({ url: `/user` })
            } else {
                res.json({ message: 'wrong-cred' })
                io.emit('wrong-cred')
            }
        } catch (error) {
            console.log(error)
            res.json({ message: 'no-email' })
            io.emit('no-email')
        }
    })
    
    return router
}

module.exports = loginRouter
