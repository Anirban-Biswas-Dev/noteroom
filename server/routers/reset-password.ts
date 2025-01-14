import { Router } from "express";
import sendMail from "../services/emailService.js";
import { getHash } from "../helpers/utils.js";
import { addToken, deleteToken, getToken } from "../services/resetTokenService.js";
import { changePassword } from "../services/userService.js";


const router = Router()

function resetPasswordRouter() {
    router.get('/password-reset', async (req, res) => {
        let reset_token = <string>req.query["token"]
        let reset_token_data = await getToken(reset_token)

        let is_valid_token = reset_token_data ? true : false

        if (is_valid_token) {
            res.render('reset-password', { accepted: true })
        } else {
            res.render('reset-password', { accepted: false })
        }
    })

    router.post('/password-change', async (req, res) => {
        console.log(req.session["stdid"])
        let reset_token = <string>req.body["reset_token"]
        let new_password = <string>req.body["password"]

        let reset_token_data = await getToken(reset_token)
        let is_valid_token = reset_token_data ? true : false

        if (is_valid_token) {
            let response = await changePassword(reset_token_data["email"], new_password)
            response === true || response === null ? (async function() {
                await deleteToken(reset_token)
                if (req.session["stdid"]) {
                    req.session.destroy(error => {
                        res.clearCookie('studentID')
                        res.clearCookie('recordID')
                    })
                }
            })() : false

        } else {
            res.json({ changed: false })
        }
    })

    router.post('/password-reset', async (req, res) => {
        try {
            let email = req.body["email"]
            let reset_token = getHash(email)
            await addToken({ email: email, reset_token: reset_token })

            let response = sendMail(email, { 
                subject: "Reset Your Password", 
                message: `Hi<br>
                We received a request to reset your password for your NoteRoom account. No worries, we've got you covered! <br>
                Click the button below to reset your password: <br>
                👉 <a href='http://127.0.0.1:2000/auth/password-reset?token=${reset_token}'>Reset My Password</a> <br><br>


                If you didn’t request this, you can safely ignore this email—your password will remain unchanged.<br><br>
                
                For your security, the link will expire in [duration, e.g., 1 hour]. <br><br>

                If you have any questions or need further assistance, feel free to reach out to us at support@noteroom.co. <br><br>

                Best regards, <br>
                The NoteRoom Team` 
            })

    
            res.json({ sent: response })
        } catch (error) {
            res.json({ sent: false })
        }
    })

    return router
}

export default resetPasswordRouter
