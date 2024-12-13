import { Router } from 'express'
import { LogIn } from '../services/userService.js'
import { Server } from 'socket.io'
const router = Router()

function loginRouter(io: Server) {
    router.get('/', (req, res) => {
        if (req.session["stdid"]) {
            res.redirect('dashboard')
        } else {
            res.status(200)
            res.render('login')
        }
    })

    router.post('/', async (req, res) => {
        try {
            let email = req.body.email
            let password = req.body.password

            let student = await LogIn.getProfile(email)
            if (password === student['studentPass']) {
                req.session["stdid"] = student["studentID"] // setting the session with the student ID
                res.cookie('recordID', student['recordID'], {
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 720
                }) // setting a cookie with a value of the document ID of the user
                res.cookie('studentID', student['studentID'], {
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 720
                }) // setting a cookie with a value of the student ID
                res.json({ url: '/dashboard' })
                // res.json({ url: `/user` })
            } else {
                res.json({ message: 'wrong-cred' })
                io.emit('wrong-cred')
            }
        } catch (error) {
            res.json({ message: 'no-email' })
            io.emit('no-email')
        }
    })

    return router
}

export default loginRouter
