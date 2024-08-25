const express = require('express')
const Students = require('../schemas/students')
const fs = require('fs') //! for local usage, will be removed
const path = require('path')
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
        let studentData = {
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
        add_student(studentData).then(student => {
            fs.mkdir(path.join(__dirname, `../../public/firebase/${student._id}`), { recursive: true }, err => {
                if(err) {
                    next(err)
                } else {
                    console.log(`Student added`);
                }
            }) //* a new dir will be created for the user in the cloud named after his doc-id. For now in the firebase directory
            //! This is for local usage, will be deleted soon when I will add them in the cloud
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
