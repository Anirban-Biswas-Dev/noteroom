const host = window.location.origin
const socket = io(host)

socket.emit('connection')

function show_warning() {
    document.querySelector('input[name="email"]').value = ""
    document.querySelector('input[name="password"]').value = ""
    document.querySelector('input[name="email"]').style.border = "2px solid red"
    document.querySelector('input[name="password"]').style.border = "2px solid red"
}

socket.on('wrong-cred', function() {
    setupErrorPopup("Sorry! Credentials are not accepted")
    show_warning()
})

socket.on('no-email', function() {
    setupErrorPopup("Sorry! No student account is associated with that email account")
    show_warning()
})

function handleCredentialResponse(response) {
    const id_token = response.credential;
    let idData = new FormData()
    idData.append("id_token", id_token)

    fetch("/login/auth/google", {
        method: "post",
        body: idData,
    })
        .then(response => response.json())
        .then(data => {
            data.message ? setupErrorPopup(data.message) : data.redirect ? window.location.href = data.redirect : "" 
        })
        .catch(error => setupErrorPopup(error.message))
        
    document.querySelector('#login-spinner').style.display = "flex";
}



document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.querySelector('.toggle-password');
    const password = document.querySelector('input[name="password"]');

    let showState = false

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function() {
            showState = !showState

            showState ? (function (){
                document.querySelector('#show-pass').classList.remove("fa-eye")
                document.querySelector('#show-pass').classList.add("fa-eye-slash")
            })() : (function () {
                document.querySelector('#show-pass').classList.remove("fa-eye-slash")
                document.querySelector('#show-pass').classList.add("fa-eye")
            })()

            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
        });
    }
});

document.querySelector('.primary-btn').addEventListener('click', function() {
    let email = document.querySelector('input[name="email"]').value
    let password = document.querySelector('input[name="password"]').value
    let loginSpinner = document.querySelector('#login-spinner')

    if(email && password) {
        let formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        fetch('/login', {
            method: 'POST',
            body: formData
        }).then(response => { return response.json() })
            .then(data => {
                if(data.url) {
                    loginSpinner.style.display = 'none'
                    window.location.href = data.url
                } else {
                    loginSpinner.style.display = 'none'
                }
            })
            .catch(error => { console.error(error) })
        }

        loginSpinner.style.display = 'flex'
})
