const express = require('express')
const Students = require('../schemas/students')
const Notes = require('../schemas/notes')
const FeedBackNotifications = require('../schemas/notifications').feedBackModel
const router = express.Router()

function dashboardRouter(io) {
    async function getStudent(studentID) {
        let student = await Students.findOne({ studentID: studentID }, { profile_pic: 1, displayname: 1, studentID: 1 })
        return student
    }

    async function getNotifications(ownerUsername) {
        let notis = await FeedBackNotifications.find({ ownerUsername: ownerUsername })
                                            .populate('noteDocID', 'title')
                                            .populate('commenterDocID', 'studentID displayname')
                                            
        return notis
    }

    router.get('/',  async (req, res, next) => {
        if(req.session.stdid) {
            let student = await getStudent(req.session.stdid)
            let notis = await getNotifications(req.cookies['recordName'])
            res.render('dashboard', { student: student, notis: notis })
        } else {
            res.redirect('login')
        }
    })

    return router
}

module.exports = dashboardRouter