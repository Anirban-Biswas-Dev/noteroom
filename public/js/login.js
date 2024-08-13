const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('connection')

function show_warning() {
    document.querySelector('input.studentid').value = ""
    document.querySelector('input.password').value = ""
    document.querySelector('input.studentid').style.border = "2px solid red"
    document.querySelector('input.password').style.border = "2px solid red"
}

socket.on('wrong-cred', function() {
    document.querySelector('p#message').innerHTML = "Sorry! Credentials are not accepted"
    show_warning()
})

socket.on('no-studentid', function() {
    document.querySelector('p#message').innerHTML = "Sorry! No student account is associated with that ID"
    show_warning()
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
