const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('connection')

function sendCred() {
    let username = document.querySelector('.username').value
    let password = document.querySelector('.password').value

    socket.emit('send-cred', username, password) // This event (send-cred) will be triggered when the button is clicked
                                                // And the username and the password will be sent
}
// This snippet will allow users see or hide password they've written

document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.querySelector('.toggle-password');
    const password = document.querySelector('.password');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.textContent = this.textContent === 'Show' ? 'Hide' : 'Show';
        });
    }
});
