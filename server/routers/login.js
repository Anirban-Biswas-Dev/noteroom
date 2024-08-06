// Don't touch this while working
const express = require('express')
const Students = require('../schemas/students')
const router = express.Router()

function loginRouter(io) {
    async function extract(studentID) {
        let student = await Students.find({ student_id: studentID })
        return new Promise((resolve, reject) => {
            if (student.length != 0) {
                resolve(student[0]["password"])
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

        extract(studentid).then(actualPass => {
            if (password === actualPass) {
                req.session.stdid = studentid
                res.redirect(`/user/${req.session.stdid}`)  
            } else {
                io.emit('wrong-password')
            }
        }).catch(err => {
            io.emit('no-studentid')
        })
    })
    return router
}

module.exports = loginRouter