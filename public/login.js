const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('connection')

function sendCred() {
    let username = document.querySelector('.username').value
    let password = document.querySelector('.password').value
    alert(server_port.port)

    socket.emit('send-cred', username, password) // This event (send-cred) will be triggered when the button is clicked
                                                // And the username and the password will be sent
}