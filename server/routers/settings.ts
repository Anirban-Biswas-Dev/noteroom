import { Router } from 'express'
import { Server } from 'socket.io'
const router = Router()

function settingsRouter(io: Server) {
    router.get('/', (req, res, next) => {
        if (req.session["stdid"]) {
            res.render('settings')
        } else {
            res.redirect('/login')
        }
    })

    return router
}

export default settingsRouter
