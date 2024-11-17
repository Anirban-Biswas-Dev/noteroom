const express = require('express')
const Students = require('../schemas/students')
const Notes = require('../schemas/notes')
const allNotifs = require('../schemas/notifications').Notifs
const feedbackNotifs = require("../schemas/notifications").feedBackNotifs
const { getSavedNotes, getNotifications, getRoot } = require('./controller')
const router = express.Router()

function dashboardRouter(io) {
    async function addSaveNote(studentDocID, noteDocID) {
        await Students.updateOne(
            { _id: studentDocID },
            { $addToSet: { saved_notes: noteDocID } }, 
            { new: true }
        )
    }

    async function readNoti(notiID) {
        await feedbackNotifs.updateOne(
            { _id: notiID },
            { $set: { isRead: true } }
        )
    }

    async function deleteSavedNote(studentDocID, noteDocID) {
        await Students.updateOne(
            { _id: studentDocID },
            { $pull: { saved_notes: noteDocID } }
        )
    }

    async function getAllNotes() {
        let notes = await Notes.find({}, { ownerDocID: 1, title: 1, content: 1 })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('ownerDocID', 'profile_pic displayname studentID username')
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
        socket.on("read-noti", (notiID) => {
            readNoti(notiID)
        })
    })

    router.get('/', async (req, res) => {
        if(req.session.stdid) {
            let root = await getRoot(Students, req.session.stdid, 'studentID', { profile_pic: 1, displayname: 1, username: 1 })
            let notis = await getNotifications(allNotifs, req.session.stdid)
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