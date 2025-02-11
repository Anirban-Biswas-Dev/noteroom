import { Router } from 'express'
import { Server } from 'socket.io'
import { getSavedNotes, profileInfo, unreadNotiCount } from '../helpers/rootInfo.js'
const router = Router()

function dashboardRouter(io: Server) {
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let admin = false
            if (req.session["stdid"] === "0511f9b4-5282-450c-a3e5-220129585b8b") {
                admin = true
            }

            let root = await profileInfo(req.session["stdid"])
            let unReadCount = await unreadNotiCount(req.session["stdid"])
            let savedNotes = await getSavedNotes(req.session["stdid"])

            res.render('dashboard/dashboard', { root: root, savedNotes: savedNotes, unReadCount: unReadCount, admin: admin })
        } else {
            res.redirect('login')
        }
    })

    return router
}

export default dashboardRouter

