const express = require('express')
const Students = require('../schemas/students')
const fs = require('fs').promises //! for local usage, will be removed
const path = require('path')
const router = express.Router()

function signupRouter(io) {
    async function addStudent(studentObj) {
        let student = await Students.create(studentObj)
        return student
    }

    router.get('/', (req, res) => {
        if (req.session.stdid) {
            res.redirect(`/user/${req.session.stdid}`)
        } else {
            res.status(200)
            res.render('sign-up')
        }
    })

    router.post('/', async (req, res, next) => {
        try {
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
            } //* Getting all the data posted by the client except the profile picture
            let profile_pic = Object.values(req.files)[0] //* Getting the profiloe picture File Object
            let student = await addStudent(studentData)
            let studentDocID = student._id
            let savePath = path.join(__dirname, `../../public/firebase/${studentDocID}`)
            fs.mkdir(savePath, { recursive: true }) //* Creating a directory named after student's doc-id
            await profile_pic.mv(path.join(savePath, profile_pic.name)) //* SAving the profile picture inside his student-folder

            Students.findByIdAndUpdate(studentDocID, { profile_pic: path.join(`firebase/${studentDocID}/`, profile_pic.name) }).then(() => {
                res.send({ url: `/login` })
            }) //* Updating the student's record database to add the profile_pic image location so that it can be deirectly used by the front-end

        } catch (error) {
            if(error.code === 11000) {
                let duplicate_field = Object.keys(error.keyValue)[0] // Sending the first duplicated field name to the client-side to show an error
                io.emit('duplicate-value', duplicate_field)
            } else {
                res.send({ message: error.message })
            }
        }
    })

    return router
}

module.exports = signupRouter
