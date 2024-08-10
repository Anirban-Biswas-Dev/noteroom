const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('connection')

// Rafi: Add your javascript here related to ejs views/user-profile.ejs