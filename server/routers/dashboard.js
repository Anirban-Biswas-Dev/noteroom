const express = require('express')
const Students = require('../schemas/students')
const allNotifs = require('../schemas/notifications').Notifs
const router = express.Router()

function dashboardRouter(io) {
    async function getStudent(studentID) {
        let student = await Students.findOne({ studentID: studentID }, { profile_pic: 1, displayname: 1, studentID: 1 })
        return student
    }

    async function getNotifications(ownerUsername) {
        let allNotifications = await allNotifs.find()
        let populatedNotifications = []
        allNotifications.map(doc => {
            if (doc['docType'] === 'feedback') {
                if(doc.ownerUsername == ownerUsername) {
                    populatedNotifications.push(doc.populate([
                        { path: 'noteDocID', select: 'title' },
                        { path: 'commenterDocID', select: 'displayname studentID' }
                    ]))
                }
            } else {
                populatedNotifications.push(doc)
            }
        })

        let data = await Promise.all(populatedNotifications)
        return data
    }
    io.on('connection', (socket) => {
        socket.on('delete-noti', async (notiID) => {
            await allNotifs.deleteOne({ _id: notiID }) // Deleteing notification based on the ID given from the frontend
        })
    })

    router.get('/', async (req, res) => {
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