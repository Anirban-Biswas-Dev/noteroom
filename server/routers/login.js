// Importing external and internal modules
const express = require('express')
const Students = require('../schemas/students')
const router = express.Router()

function add_student(studentObj) {
    let student = Students.create(studentObj)
    return student
}

router.get('/', (req, res) => {
    res.status(200)
    res.render('login')
})

router.post('/', (req, res) => {
    let studentid = req.body.studentid
    let password = req.body.password
    add_student({
        student_id: studentid,
        password: password
    }).then((student) => {
        console.log(`Student added ${student}`);
    }).catch((err) => {
        console.log(err.message);
    })
    res.send(`<h1>Hello ${studentid}</h1>`)
})

module.exports = router

// Arnob, I'll handle this file. DON'T TOUCH IT! DANGEROUS ERRORS WILL KILL YOU!