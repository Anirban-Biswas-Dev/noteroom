import { Router } from 'express'
const router = Router()

function settingsRouter(io) {
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
