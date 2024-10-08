const express = require('express')
const router = express.Router()

function settingsRouter(io) {
    router.get('/', (req, res, next) => {
        if(req.session.stdid) {
            res.render('settings')
        } else {
            res.redirect('/login')
        }
    })

    return router
}

module.exports = settingsRouter
