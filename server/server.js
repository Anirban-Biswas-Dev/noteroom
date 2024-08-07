const express = require('express')
const path = require('path')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: '*' } })

// const session = require('express-session')
// const mongoose = require('mongoose')
// const bodyParser = require('body-parser')
// const loginRouter = require('./routers/login')
// const userRouter = require('./routers/user')

// const url = 'mongodb://localhost:27017/information'
// mongoose.connect(url).then(() => {
//     console.log(`Connected to database information`);
// }) 

const port = 2000

// Setting the view engine as EJS. And all the ejs files are stored in "/views" folder
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

app.use(express.static(path.join(__dirname, '../public'))) // Middleware for using static files. All are stored in "/public" folder
// app.use(bodyParser.urlencoded({
//     extended: true
// })) // Middleware for working with POST requests. 
// app.use(session({
//     secret: 'a-secret-key',
//     resave: true,
//     saveUninitialized: true
// })) // Middleware for working with sessions
// app.use('/login', loginRouter(io)) // Middleware for using routers of "/routers/login.js". 
// app.use('/user', userRouter(io)) // Middleware for using routers of "/routers/user.js". 

// app.get('/', (req, res) => {
//     req.session.destroy()
//     res.clearCookie('stdid')
//     res.redirect('/login')
// })

app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/bar-loader', (req, res) => {
    res.render('bar-loader')
})
app.get('/user-profile', (req, res) => {
    res.render('user-profile')
})

// Connecting with the client to the server using socket
io.on('connection', (socket) => {
    console.log(`User captured ID: ${socket.id}`);
})

server.listen(port, () => {
    console.log(`Server is listening on localhost:${port}`);
})
