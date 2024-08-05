// Don't touch this while working
const express = require('express')
const router = express.Router()

function userRouter() {
    router.get('/:stdid', (req, res) => {
        if (req.session.stdid) {
            if (req.session.stdid == req.params.stdid) {
                // TODO: adding self-profile 
                res.send("Hello user! Welcome!")
            } else {
                // TODO: adding others-profile
                res.send("Someone else's profile")
            }
        } else {
            res.redirect('/login')
        }
    })
    return router
}

module.exports = userRouter