const express = require('express')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })
const cookieParser = require('cookie-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const archiver = require('archiver')
const cors = require('cors')

const loginRouter = require('./routers/login')
const userRouter = require('./routers/user')
const signupRouter = require('./routers/sign-up')
const errorHandler = require('./errorhandlers/errors')
const uploadRouter = require('./routers/upload-note')
const noteViewRouter = require('./routers/note-view')
const dashboardRouter = require('./routers/dashboard')
const serachProfileRouter = require('./routers/search-profile')
const settingsRouter = require('./routers/settings')

const Notes = require('./schemas/notes')
const Students = require('./schemas/students')

const url = process.env.MONGO_URI
mongoose.connect(url).then(() => {
    console.log(`Connected to database information`);
}) 

const port = process.env.PORT

// Setting the view engine as EJS. And all the ejs files are stored in "/views" folder
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

app.use(cors())
app.use(express.static(path.join(__dirname, '../public'))) // Middleware for using static files. All are stored in "/public" folder
app.use(bodyParser.urlencoded({
    extended: true
})) // Middleware for working with POST requests.
// app.use(express.json());
app.use(session({
    secret: 'a-secret-key',
    resave: true,
    saveUninitialized: true
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
app.use(errorHandler) // Middleware for handling errors

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.clearCookie('stdid')
    res.redirect('/login')
})

app.get('/', (req, res) => {
    res.redirect('/login')
})

app.get('/support', (req, res) => {
    res.render('support')
})
app.get('/confetti', (req, res) => {
    res.render('confetti')
})
app.get('/about-us', (req, res) => {
    res.render('about-us')
})
app.get('/privacy-policy', (req, res) => {
    if(req.session.stdid) {
        res.render('privacy-policy')
    } else {
        res.redirect('/login')
    }
})

app.post('/download', async (req, res) => {
    let noteID = req.body.noteID
    let noteTitle = req.body.noteTitle

    const noteLinks = (await Notes.findById(noteID, { content: 1 })).content
    
    res.setHeader('Content-Type', 'application/zip');

    const sanitizeFilename = (filename) => {
        return filename.replace(/[^a-zA-Z0-9\.\-\_]/g, '_'); // Replace any invalid characters with an underscore
    }
    res.setHeader('Content-Disposition', `attachment; filename=${sanitizeFilename(noteTitle)}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (let imageUrl of noteLinks) {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${imageUrl}: ${response.statusText}`);
            }

            let arrayBuffer = await response.arrayBuffer()
            let buffer = Buffer.from(arrayBuffer)

            let fileName = path.basename(new URL(imageUrl).pathname);
            archive.append(buffer, { name: fileName });
        } catch (err) {
            console.error(`Error fetching image: ${err.message}`);
            return;
        }
    }
    archive.finalize();
})

app.get('/search', async (req, res, next) => {
    let searchTerm = req.query.q
    const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
    let notes = await Notes.find({ title: { $regex: regex } }, { title: 1 })
    res.json(notes)
})

app.get('/getnote', async (req, res, next) => {
    let type = req.query.type
    async function getSavedNotes(studentDocID) {
        let student = await Students.findById(studentDocID, { saved_notes: 1 } )
        let saved_notes_ids = student['saved_notes']
        let notes = await Notes.find({ _id: { $in: saved_notes_ids } }, { title: 1 })
        return notes
    }
    if(type === 'save') {
        let studentDocID = req.query.studentDocID
        let savedNotes = await getSavedNotes(studentDocID)
        res.json(savedNotes)
    } else if(type === 'seg') {
        let {page, count} = req.query
        let skip = (page - 1) * count
        let notes = await Notes.find({}).skip(skip).limit(count).populate('ownerDocID', 'profile_pic displayname studentID')
        if(notes.length != 0) {
            res.json(notes)
        } else {
            res.json([])
        }
    }
})

app.get('*', (req, res) => {
    res.status(404)
    res.render('404-error', { message: 'The page you are looking for is not found' }) 
}) // 404 if any url requested by the user is not found

server.listen(port, () => {
    console.log(`Server is listening on localhost:${port}`);
})
