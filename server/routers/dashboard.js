const express = require('express')
const Students = require('../schemas/students')
const Notes = require('../schemas/notes')
const allNotifs = require('../schemas/notifications').Notifs
const { getSavedNotes, getNotifications } = require('./controller')
const router = express.Router()

function dashboardRouter(io) {
    async function addSaveNote(studentDocID, noteDocID) {
        await Students.updateOne(
            { _id: studentDocID },
            { $addToSet: { saved_notes: noteDocID } }, 
            { new: true }
        )
    }

    async function deleteSavedNote(studentDocID, noteDocID) {
        await Students.updateOne(
            { _id: studentDocID },
            { $pull: { saved_notes: noteDocID } }
        )
    }

    async function getStudent(studentID) {
        let student = await Students.findOne({ studentID: studentID }, { profile_pic: 1, displayname: 1, studentID: 1 })
        return student
    }

    async function getAllNotes() {
        let notes = await Notes.find({}, { ownerDocID: 1, title: 1, content: 1 }).populate('ownerDocID', 'profile_pic displayname studentID')
        return notes
    }

    io.on('connection', (socket) => {
        socket.on('delete-noti', async (notiID) => {
            await allNotifs.deleteOne({ _id: notiID }) // Deleteing notification based on the ID given from the frontend
        })
        socket.on('save-note', async (studentDocID, noteDocID) => {
            await addSaveNote(studentDocID, noteDocID)
        })
        socket.on('delete-saved-note', async (studentDocID, noteDocID) => {
            await deleteSavedNote(studentDocID, noteDocID)
        })
    })

    router.get('/', async (req, res) => {
        if(req.session.stdid) {
            let root = await getStudent(req.session.stdid)
            let notis = await getNotifications(allNotifs, req.cookies['recordName'])
            let allNotes = await getAllNotes()
            let savedNotes = await getSavedNotes(Students, Notes, req.session.stdid)
            res.render('dashboard', { root: root, notis: notis, notes: allNotes, savedNotes: savedNotes })
        } else {
            res.redirect('login')
        }
    })

    return router
}

module.exports = dashboardRouter