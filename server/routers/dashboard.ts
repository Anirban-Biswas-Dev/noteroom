import { Router } from 'express'
import Alerts from '../schemas/alerts.js'
import { Server } from 'socket.io'
import { getAllNotes } from '../services/noteService.js'
import { getNotifications, getSavedNotes, profileInfo, unreadNotiCount } from '../helpers/rootInfo.js'
const router = Router()

function dashboardRouter(io: Server) {
    async function getAlert() {
        let alert = (await Alerts.find({}).sort({ createdAt: -1 }))[0];
        return alert
    }

    //# Managing Requests (Routes)
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let alert = await getAlert()

            //=> Root Information
            let root = await profileInfo(req.session["stdid"])
            let notis = await getNotifications(req.session["stdid"])
            let unReadCount = await unreadNotiCount(req.session["stdid"])

            let allNotes = await getAllNotes()
            let savedNotes = await getSavedNotes(req.session["stdid"])

            res.render('dashboard', { root: root, notis: notis, notes: allNotes, savedNotes: savedNotes, alert: alert, unReadCount: unReadCount })
        } else {
            res.redirect('login')
        }
    })

    return router
}

export default dashboardRouter

