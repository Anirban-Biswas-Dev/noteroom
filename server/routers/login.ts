import {Router} from 'express'
import {LogIn} from '../services/userService.js'
import {Server} from 'socket.io'
import {verifyToken} from "../services/googleAuth.js";
import { log, setSession } from '../helpers/utils.js';
import { config } from 'dotenv';
import {join} from 'path';
import * as process from "node:process";

config({ path: join(__dirname, '../.env') })

const router = Router()
const client_id = process.env.GOOGLE_CLIENT_ID

function loginRouter(io: Server) {
    router.get('/', (req, res) => {
        try {
            if (req.session["stdid"]) {
                res.redirect('dashboard')
                log('info', `On /login StudentID=${req.session['stdid'] || "--studentid--"} redirected to dashboard.`)
            } else {
                res.status(200)
                res.render('login')
                log('info', `On /login StudentID=${req.session['stdid'] || "--studentid--"}: redirected to login.`)
            }
        } catch (error) {
            log('error', `On /login StudentID=${req.session["stdid"] || "--studentid--"}: Couldn't render login: ${error.message}`)
        }
    })

    router.post('/auth/google', async (req, res) => {
        try {
            let { id_token } = req.body

            let userData = await verifyToken(client_id, id_token)
            let email = userData.email
            let user = await LogIn.getProfile(email)
            
            if(user["authProvider"] !== null) {
                setSession({recordID: user['recordID'], studentID: user["studentID"], username: user["username"] }, req, res)
                res.send({ redirect: '/dashboard' })
                log('info', `On /login/auth/google StudentID=${req.session['stdid'] || "--studentid--"}: login successfully.`)
            } else {
                res.json({message: 'Sorry! No student account is associated with that email account'})
            }
        } catch (error) {
            log('error', `On /login/auth/google StudentID=${req.session['stdid'] || "--studentid--"}: couldn't login: ${error.message}`)
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
                        setSession({recordID: student['recordID'], studentID: student["studentID"], username: student["username"] }, req, res)
                        log('info', `On /login StudentID=${req.session['stdid'] || "--studentid--"}: login successfully.`)
                        res.json({ ok: true, url: '/dashboard' })
                    } else {
                        io.emit('wrong-cred')
                    }
                } else {
                    io.emit('wrong-cred')
                }
            }

        } catch (error) {
            log('error', `On /login/auth/google StudentID=${req.session['stdid'] || "--studentid--"}: login failure.`)
            io.emit('no-email')
        }
    })

    return router
}

export default loginRouter
