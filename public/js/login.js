const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('connection')

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
