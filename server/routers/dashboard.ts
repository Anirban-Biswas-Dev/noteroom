import { Router } from 'express'
import Alerts from '../schemas/alerts.js'
import { Server } from 'socket.io'
import { getSavedNotes, profileInfo, unreadNotiCount } from '../helpers/rootInfo.js'
const router = Router()

function dashboardRouter(io: Server) {
    async function getAlert() {
        let alert = (await Alerts.find({}).sort({ createdAt: -1 }))[0];
        return alert
    }

    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let alert = await getAlert()

            let root = await profileInfo(req.session["stdid"])
            let unReadCount = await unreadNotiCount(req.session["stdid"])
            let savedNotes = await getSavedNotes(req.session["stdid"])

            res.render('dashboard/dashboard', { root: root, savedNotes: savedNotes, alert: alert, unReadCount: unReadCount })
        } else {
            res.redirect('login')
        }
    })

    return router
}

export default dashboardRouter

