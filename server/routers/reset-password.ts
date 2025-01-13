import { response, Router } from "express";
import sendMail from "../services/emailService.js";

const router = Router()

function resetPasswordRouter() {
    router.get('/password-reset', async (req, res) => {
        res.render('reset-password')
    })

    router.post('/password-reset', async (req, res) => {
        try {
            let email = req.body["email"]
            let response = sendMail(email, { subject: "Helllo!", message: "<b>hi there!</b>" })
    
            res.json({ sent: response })
        } catch (error) {
            res.json({ sent: response })
        }
    })

    return router
}

export default resetPasswordRouter
