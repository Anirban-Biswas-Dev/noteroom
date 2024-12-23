import {Router} from 'express'
import {LogIn} from '../services/userService.js'
import {Server} from 'socket.io'
import {verifyToken} from "../services/googleAuth.js";

const router = Router()
const client_id = "325870811550-0c3n1c09gb0mncb0h4s5ocvuacdd935k.apps.googleusercontent.com"

function setSession({ recordID, studentID }, req: any, res: any) {
    req["session"]["stdid"] = studentID // setting the session with the student ID
    res["cookie"]('recordID', recordID, {
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    }) // setting a cookie with a value of the document ID of the user
    res["cookie"]('studentID', studentID, {
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    })
}

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

    router.post('/', async (req, res, next) => {
        try {
            let email = req.body.email
            let password = req.body.password

            let student = await LogIn.getProfile(email)
            if(student["authProvider"] === null) {
                if (password === student['studentPass']) {
                    setSession({recordID: student['recordID'], studentID: student["studentID"]}, req, res)
                    res.json({ url: '/dashboard' })
                } else {
                    res.json({ message: 'wrong-cred' })
                    io.emit('wrong-cred')
                }
            }
        } catch (error) {
            res.json({ message: 'no-email' })
            io.emit('no-email')
        }
    })

    return router
}

export default loginRouter
