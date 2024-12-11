import { Router } from 'express'
import Students from '../schemas/students.js'
import Notes from '../schemas/notes.js'
import Alerts from '../schemas/alerts.js'
import { Notifs as allNotifs } from '../schemas/notifications.js'
import { getSavedNotes, getNotifications, getRoot, unreadNotiCount } from './controller.js'
const router = Router()

function dashboardRouter(io) {

    async function addSaveNote(studentDocID, noteDocID) {
        await Students.updateOne(
            { _id: studentDocID },
            { $addToSet: { saved_notes: noteDocID } },
            { new: true }
        )
    }

    async function readNoti(notiID) {
        await allNotifs.updateOne(
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
        let notes = await Notes.find({}, { ownerDocID: 1, title: 1, content: 1, feedbackCount: 1 })
            .sort({ createdAt: -1 })
            .limit(3)
            .populate('ownerDocID', 'profile_pic displayname studentID username')
        return notes
    }

    async function getAlert() {
        let alert = (await Alerts.find({}).sort({ createdAt: -1 }))[0];
        return alert
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
        if (req.session.stdid) {
            let alert = await getAlert()
            let root = await getRoot(Students, req.session.stdid, 'studentID', { profile_pic: 1, displayname: 1, username: 1 })
            let notis = await getNotifications(allNotifs, req.session.stdid)
            let unReadCount = await unreadNotiCount(allNotifs, req.session.stdid)
            let allNotes = await getAllNotes()
            let savedNotes = await getSavedNotes(Students, Notes, req.session.stdid)
            res.render('dashboard', { root: root, notis: notis, notes: allNotes, savedNotes: savedNotes, alert: alert, unReadCount: unReadCount })
        } else {
            res.redirect('login')
        }
    })

    return router
}

export default dashboardRouter

