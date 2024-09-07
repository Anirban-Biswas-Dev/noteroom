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

const loginRouter = require('./routers/login')
const userRouter = require('./routers/user')
const signupRouter = require('./routers/sign-up')
const errorHandler = require('./errorhandlers/errors')
const uploadRouter = require('./routers/upload-note')
const noteViewRouter = require('./routers/note-view')
const dashboardRouter = require('./routers/dashboard')

// const url = process.env.MONGO_URI
const url = 'mongodb://localhost:27017/information'
mongoose.connect(url).then(() => {
    console.log(`Connected to database information`);
}) 

const port = process.env.PORT

// Setting the view engine as EJS. And all the ejs files are stored in "/views" folder
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

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
app.use(errorHandler) // Middleware for handling errors

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.clearCookie('stdid')
    res.redirect('/login')
})

app.get('/', (req, res) => {
    res.redirect('/login')
})

app.get('/search-profile', (req, res) => {
    res.render('search-profile')
})
app.get('/dashboard', (req, res) => {
    res.render('dashboard')
})
app.get('/settings', (req, res) => {
    res.render('settings')
})
app.get('/support', (req, res) => {
    res.render('support')
})
app.get('*', (req, res) => {
    res.status(404)
    res.render('404-error', { message: 'The page you are looking for is not found' }) 
}) // 404 if any url requested by the user is not found

io.on('connection', function(socket) {
})

server.listen(port, () => {
    console.log(`Server is listening on localhost:${port}`);
})
