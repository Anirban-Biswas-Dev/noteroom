import { Router } from "express";
import sendMail from "../services/emailService.js";
import { getHash } from "../helpers/utils.js";
import { addToken, deleteToken, getToken } from "../services/resetTokenService.js";
import { changePassword, Convert } from "../services/userService.js";
import mongoose from "mongoose";
import { templates } from "../helpers/emailTemplates.js";


const sessionSchema = new mongoose.Schema({}, { collection: 'sessions', strict: false });
const Session = mongoose.model('Session', sessionSchema);


async function deleteSessionsByStudentID(studentID: string) {
    try {
        await Session.deleteMany({
            session: { $regex: `"stdid":"${studentID}"` } // Match the serialized JSON
        });
    } catch (error) {
        console.error('Error deleting sessions:', error);
    }
}


const router = Router()

function resetPasswordRouter() {
    router.get('/password-reset', async (req, res) => {
        let reset_token = <string>req.query["token"]
        if (reset_token) {
            let reset_token_data = await getToken(reset_token)
            let is_valid_token = reset_token_data ? true : false
    
            if (is_valid_token) {
                res.render('reset-password', { accepted: true })
            } else {
                res.render('reset-password', { accepted: false })
            }

        } else {
            res.render('reset-password', { accepted: null })
        }
    })

    router.post('/password-reset', async (req, res) => {
        try {
            let email = req.body["email"]
            let reset_token = getHash(email)
            let tokenAdded = await addToken({ email: email, reset_token: reset_token })
            
            if(tokenAdded) {
                let displayname = await Convert.getDisplayName_email(email)
                let response = sendMail(email, { 
                    subject: "Reset Your NoteRoom Password", 
                    message: templates.reset_password({ reset_token: reset_token, displayname: displayname })
                })
    
                res.json({ sent: response })
            } else if (tokenAdded === null) {
                res.json({ sent: true })
            } else {
                res.json({ sent: false })
            }
            
        } catch (error) {
            res.json({ sent: false })
        }
    })


    router.get('/password-change', async (req, res) => {
        if (req.session["stdid"]) {
            res.render('change-password')
        } else {
            res.redirect('/login')
        }
    })

    router.post('/password-change', async (req, res) => {
        let action = req.query["action"]

        if (action === "reset") {
            let reset_token = <string>req.body["reset_token"]
            let new_password = <string>req.body["password"]
    
            let reset_token_data = await getToken(reset_token)
            let is_valid_token = reset_token_data ? true : false
    
            if (is_valid_token) {
                let response = await changePassword(reset_token_data["email"], new_password)
                if (response) {
                    await deleteToken(reset_token)
                    let studentID = await Convert.getStudentID_email(reset_token_data["email"])
                    await deleteSessionsByStudentID(studentID) //* deleting all the sessions of a user
    
                    res.json({ changed: true })
                } else {
                    res.json({ changed: false })
                }
            } else {
                res.json({ changed: false })
            }
        } 
        
        else if (action === "change") {
            if (req.session["stdid"]) {
                let current_password = <string>req.body["current_password"]
                let new_password = <string>req.body["new_password"]
                let studentID = req.session["stdid"]
                let email = await Convert.getEmail_studentid(studentID)
                
                let changed = await changePassword(email, new_password, current_password)

                res.json({ changed: changed })
            } else {
                res.redirect('/login')
            }
        }
    })

    

    return router
}

export default resetPasswordRouter
