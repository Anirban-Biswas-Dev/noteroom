import { Router } from 'express'
import Students from '../schemas/students.js'
import Notes from '../schemas/notes.js'
import Alerts from '../schemas/alerts.js'
import { Notifs as allNotifs } from '../schemas/notifications.js'
import { getSavedNotes, getNotifications, getRoot, unreadNotiCount } from './controller.js'
import { Server } from 'socket.io'
import { noteSocketHandler, notificationSocketHandler } from '../services/ioService.js'
import { getAllNotes } from '../services/noteService.js'
import { profileInfo } from '../helpers/rootInfo.js'
const router = Router()

function dashboardRouter(io: Server) {

    async function getAlert() {
        let alert = (await Alerts.find({}).sort({ createdAt: -1 }))[0];
        return alert
    }

    io.on('connection', (socket) => {
        noteSocketHandler(socket)
        notificationSocketHandler(socket)
    })

    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let alert = await getAlert()
            // let root = await getRoot(Students, req.session["stdid"], 'studentID', { profile_pic: 1, displayname: 1, username: 1 })
            let root = await profileInfo(req.session["stdid"])
            let notis = await getNotifications(allNotifs, req.session["stdid"])
            let unReadCount = await unreadNotiCount(allNotifs, req.session["stdid"])
            let allNotes = await getAllNotes()
            let savedNotes = await getSavedNotes(Students, Notes, req.session["stdid"])
            res.render('dashboard', { root: root, notis: notis, notes: allNotes, savedNotes: savedNotes, alert: alert, unReadCount: unReadCount })
        } else {
            res.redirect('login')
        }
    })

    return router
}

export default dashboardRouter

