const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('connection')

socket.on('wrong-password', function() {
    alert('Password is incorrect')
    location.reload()
})

socket.on('no-studentid', function() {
    alert('No associated account with this id')
    location.reload()
})

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
