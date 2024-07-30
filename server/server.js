// Importing external and internal modules
const express = require('express')
const path = require('path')
const app = express()
const server = require('http').createServer(app)
const socket = require('socket.io')(server, {
    cors: { origin: '*' }
})
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

// const loginRouter = require('./routers/login') 

// Connecting to 'MY LOCAL' database on 'MY LOCAL MACHINE'.  

// const url = 'mongodb://localhost:27017/information'
// mongoose.connect(url).then(() => {
//     console.log(`Connected to database information`);
// })  //So Arnob, keep these lines(12-19) commented when you are working

const port = 2000 // localhost port

// Setting the view engine as EJS. And all the ejs files are stored in "/views" folder
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'))

app.use(express.static(path.join(__dirname, '../public'))) // Middleware for using static files. All are stored in "/public" folder

// app.use(bodyParser.urlencoded({
//     extended: true
// })) // Middleware for working with POST requests. 
// app.use('/login', loginRouter) // Middleware for using routers of "/routers/login.js". Keep this lines(28-31) commented while working 

app.get('/login', (req, res) => {
    res.status(200)
    res.render('login')
}) /* Arnob here is a simple code snippet that will help you to run your code in browser in real-time 
Whenever you will add a new ejs file, to check that in the browser, do these:
    => Copy from line 34 to 37, I mean that app.get code snippet
    => Paste below this comment
    => In the first argument, I mean where I have place '/login', use any route you want. That will be used to locate your file
        in browser.
    => In app.render(), write the ejs file(without the extension) name that you want to see in the broswer. In the above example 
        I have written 'login' to see the 'login.ejs' file (in views folder) to see in the browser.
    => Now in the browser, use the route (in this case 'localhost:2000/login') to see the file. 
    => Reload the browser if you change the ejs file

    I am giving the bar-loader example below that
*/

app.get('/loader', (req, res) => { // route='/loader' that means localhost:2000/loader
    res.status(200)                                   //                  ^
    res.render('bar-loader') // Rendering bar-loader.ejs in that route -----|
})

// Connecting with the client to the server using socket
socket.on('connection', (client_socket) => {
    console.log(`User captured ID: ${client_socket.id}`);
})

// Server is in listening mode! Ok, thats why this is called a server. Duuh!
server.listen(port, () => {
    console.log(`Server is listening on localhost:${port}`);
})
