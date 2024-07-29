const express = require('express')
const path = require('path')
const app = express()
const server = require('http').createServer(app)
const socket = require('socket.io')(server, {
    cors: { origin: '*' }
})
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Students = require('./schemas/students')
const Notes = require('./schemas/notes')
const Interactions = require('./schemas/interactions')

// const url = 'mongodb+srv://rafirahmanpro:ohJhvoK6ELpvq5Km@cluster0.uregmk5.mongodb.net/information?retryWrites=true&w=majority&appName=Cluster0'
// mongoose.connect(url)

const url = 'mongodb://localhost:27017/information'
mongoose.connect(url).then(() => {
    console.log(`Connected to database information`);
})

const port = 2000

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))
app.use(express.static(path.join(__dirname, '../public')))
app.use(bodyParser.urlencoded({
    extended: true
}))

function add_student(studentObj) {
    let student = Students.create(studentObj)
    return student
}

app.get('/login', (req, res) => {
    res.status(200)
    res.render('login')
})

app.post('/login', (req, res) => {
    let studentid = req.body.studentid
    let password = req.body.password
    add_student({
        student_id: studentid,
        password: password
    }).then((student) => {
        console.log(`Student added ${student}`);
    }).catch((err) => {
        console.log(err.message);
    })
    res.send(`<h1>Hello ${studentid}</h1>`)
})

socket.on('connection', (client_socket) => {
    console.log(`User captured ID: ${client_socket.id}`);
})

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})
