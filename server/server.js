const express = require('express')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })

const session = require('express-session')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const loginRouter = require('./routers/login')
const userRouter = require('./routers/user')
const signupRouter = require('./routers/sign-up')
const errorHandler = require('./errorhandlers/errors')

const url = process.env.MONGO_URI
mongoose.connect(url).then(() => {
    console.log(`Connected to database information`);
}) 

const port = 2000

// Setting the view engine as EJS. And all the ejs files are stored in "/views" folder
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

app.use(express.static(path.join(__dirname, '../public'))) // Middleware for using static files. All are stored in "/public" folder
app.use(bodyParser.urlencoded({
    extended: true
})) // Middleware for working with POST requests. 
app.use(session({
    secret: 'a-secret-key',
    resave: true,
    saveUninitialized: true
})) // Middleware for working with sessions
app.use('/login', loginRouter(io)) // Middleware for using routers of "/routers/login.js". 
app.use('/user', userRouter(io)) // Middleware for using routers of "/routers/user.js".
app.use('/sign-up', signupRouter(io))
app.use(errorHandler) // Middleware for handling errors

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.clearCookie('stdid')
    res.redirect('/login')
})

app.get('/', (req, res) => {
    res.redirect('/sign-up')
})

app.get('/search-profile', (req, res) => {
    res.render('search-profile')
})
app.get('/upload-note', (req, res) => {
    res.render('upload-note')
})
app.get('/privacy-policy', (req, res) => {
    res.render('privacy-policy')
})

app.get('*', (req, res) => {
    res.status(404)
    res.render('404-error', { message: 'The page you are looking for is not found' }) 
}) // 404 if any url requested by the user is not found

// Connecting with the client to the server using socket
io.on('connection', (socket) => {})

server.listen(port, () => {
    console.log(`Server is listening on localhost:${port}`);
})
