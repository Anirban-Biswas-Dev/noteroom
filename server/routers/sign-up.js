const express = require('express')
const Students = require('../schemas/students')
const router = express.Router()

function signupRouter(io) {
    async function add_student(studentObj) {
        let student = await Students.create(studentObj)
        return student
    }

    router.get('/', (req, res) => {
        if(req.session.stdid) {
            res.redirect(`/user/${req.session.stdid}`)
        } else {
            res.status(200)
            res.render('sign-up')
        }
    })

    router.post('/', (req, res, next) => {
        let student = {
            displayname: req.body.displayname,
            email: req.body.email,
            password: req.body.password,
            studentid: req.body.studentid,
            rollnumber: req.body.rollnumber,
            collegesection: req.body.collegesection,
            collegeyear: req.body.collegeyear,
            bio: req.body.bio,
            favouritesubject: req.body.favouritesubject,
            notfavsubject: req.body.notfavsubject,
            group: req.body.group,
            username: req.body.username
        }
        add_student(student).then(student => {
            console.log(`Student added`);
            res.redirect('/login')
        }).catch(err => {
            // err.code == 11000 for duplicate value of a unique field
            if(err.code === 11000) {
                let duplicate_field = Object.keys(err.keyValue)[0] // I am sending the first duplicated field name to the client-side to show an error
                io.emit('duplicate-value', duplicate_field)
            } else {
                next(err)
            }
        })
    })

    return router
}

module.exports = signupRouter
