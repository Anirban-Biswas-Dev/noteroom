import express, { static as _static } from 'express'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import cookieParser from 'cookie-parser'
import session from 'express-session'
import { connect } from 'mongoose'
import _pkg from 'body-parser';
const { urlencoded } = _pkg;
import fileUpload from 'express-fileupload'
import cors from 'cors'
import pkg from 'connect-mongo';
const { create } = pkg;

import loginRouter from './routers/login.js'
import userRouter from './routers/user.js'
import signupRouter from './routers/sign-up.js'
import errorHandler from './middlewares/errors.js'
import uploadRouter from './routers/upload-note.js'
import noteViewRouter from './routers/note-view.js'
import dashboardRouter from './routers/dashboard.js'
import serachProfileRouter from './routers/search-profile.js'
import settingsRouter from './routers/settings.js'
import apiRouter  from './services/apis.js';

import Alerts from './schemas/alerts.js'

import noteIOHandler from './services/io/ioNoteService.js';
import notificationIOHandler from './services/io/ioNotifcationService.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

const app = express()
const server = createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
const url = process.env.MONGO_URI
connect(url).then(() => {
    console.log(`Connected to database information`);
})

const port = process.env.PORT

// Setting the view engine as EJS. And all the ejs files are stored in "/views" folder
app.set('view engine', 'ejs')
app.set('views', join(__dirname, '../views'))

app.use(cors())
app.use(_static(join(__dirname, '../public'))) // Middleware for using static files. All are stored in "/public" folder
app.use(urlencoded({
    extended: true
})) // Middleware for working with POST requests.
// app.use(express.json());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: create({
        mongoUrl: url,
        ttl: 60 * 60 * 720
    }),
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    }
})) // Middleware for working with sessions
app.use(cookieParser()) // Middleware for working with cookies
app.use(fileUpload()) // Middleware for working with files
app.use('/login', loginRouter(io))
app.use('/user', userRouter(io))
app.use('/sign-up', signupRouter(io))
app.use('/upload', uploadRouter(io))
app.use('/view', noteViewRouter(io))
app.use('/dashboard', dashboardRouter(io))
app.use('/search-profile', serachProfileRouter(io))
app.use('/settings', settingsRouter(io))
app.use('/api', apiRouter(io))
app.use(errorHandler) // Middleware for handling errors

app.get('/logout', (req, res) => {
    req.session.destroy(error => {
        res.clearCookie('studentID')
        res.clearCookie('recordID')
        if(!error) {
            res.redirect('/login')
        } else {
            res.redirect('/login')
        }
    })
})

app.get('/', (req, res) => {
    res.redirect('/login')
})

app.get('/support', (req, res) => {
    res.render('support')
})
app.get('/about-us', (req, res) => {
    res.render('about-us')
})
app.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy')
})
app.get("/test", (req, res) => {
    res.render('test')
})
app.get('/signup2', (req, res) => {
    res.render('signup2')
})

app.get('/home', (req, res) => {
    res.render('home')
})

export let userSocketMap: Map<string, string> = new Map()
io.on('connection', (socket) => {
    let studentID = <string>socket.handshake.query.studentID
    if (studentID) {
        userSocketMap.set(studentID, socket.id)
    }

    socket.on('disconnect', () => {
        userSocketMap.forEach((studentID, sockID) => {
            if (sockID === socket.id) {
                userSocketMap.delete(studentID)
            }
        })
    })

    notificationIOHandler(io, socket)
    noteIOHandler(io, socket)
})

app.get('/message', async (req, res) => {
    if (req.session && req.session["stdid"] == "1094a5ad-d519-4055-9e2b-0f0d9447da02") {
        if (req.query.message == undefined) {
            res.render('message')
        } else {
            let message = req.query.message
            let type = req.query.type

            await Alerts.create({ message: message, type: type })

            res.send({ url: '/dashboard' })
        }
    } else {
        res.status(404)
        res.render('404-error', { message: 'The page you are looking for is not found' })
    }
})

app.get('*', (req, res) => {
    res.status(404)
    res.render('404-error', { message: 'The page you are looking for is not found' })
}) // 404 if any url requested by the user is not found

server.listen(port, () => {
    console.log(`Server is listening on ${port}`);
})
