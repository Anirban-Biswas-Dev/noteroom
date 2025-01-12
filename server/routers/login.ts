import {Router} from 'express'
import {LogIn} from '../services/userService.js'
import {Server} from 'socket.io'
import {verifyToken} from "../services/googleAuth.js";
import { setSession } from '../helpers/utils.js';
import { config } from 'dotenv';
import {dirname, join} from 'path';
import {fileURLToPath} from "url";
import * as process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') })

const router = Router()
const client_id = process.env.GOOGLE_CLIENT_ID

function loginRouter(io: Server) {
    router.get('/', (req, res) => {
        if (req.session["stdid"]) {
            res.redirect('dashboard')
        } else {
            res.status(200)
            res.render('login')
        }
    })

    router.post('/auth/google', async (req, res) => {
        try {
            let { id_token } = req.body

            let userData = await verifyToken(client_id, id_token)
            let email = userData.email
            let user = await LogIn.getProfile(email)
            
            if(user["authProvider"] !== null) {
                setSession({recordID: user['recordID'], studentID: user["studentID"]}, req, res)
                res.send({ redirect: '/dashboard' })
            } else {
                res.json({message: 'Sorry! No student account is associated with that email account'})
            }
        } catch (error) {
            res.json({message: error})
        }
    })

    router.post('/', async (req, res) => {
        try {
            let email = req.body.email
            let password = req.body.password

            if (!(email && password)) {
                res.json({ ok: false, field: email === "" ? "email" : "password" })
            } else {
                let student = await LogIn.getProfile(email)
                if(student["authProvider"] === null) {
                    if (password === student['studentPass']) {
                        setSession({recordID: student['recordID'], studentID: student["studentID"]}, req, res)
                        res.json({ ok: true, url: '/dashboard' })
                    } else {
                        io.emit('wrong-cred')
                    }
                } else {
                    io.emit('wrong-cred')
                }
            }

        } catch (error) {
            io.emit('no-email')
        }
    })

    return router
}

export default loginRouter
