const host = window.location.origin
const socket = io(host)

socket.on('wrong-cred', function () {
    document.querySelector('#login-spinner').style.display = "none"
    setupErrorPopup("Sorry! Credentials are not accepted")
})

socket.on('no-email', function () {
    document.querySelector('#login-spinner').style.display = "none"
    setupErrorPopup("Sorry! No student account is associated with that email account")
})

document.querySelectorAll('.custom__input-field').forEach(inputField => {
    inputField.addEventListener('input', function (e) {
        if (!e.target.value || !inputField.value) {
            document.querySelector('.primary-btn').disabled = true
        } else {
            document.querySelector('.primary-btn').disabled = false
        }
    })
})

// google auth handler
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
            data.message ? (function () {
                setupErrorPopup(data.message)
                document.querySelector('#login-spinner').style.display = "none"
            })() : data.redirect ? window.location.href = data.redirect : ""
        })
        .catch(error => (function () {
            document.querySelector('#login-spinner').style.display = "none";
            setupErrorPopup("Sorry! Something went wrong with the server. Please try again a bit later!")
        })())

    document.querySelector('#login-spinner').style.display = "flex";
}



document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('input[name="password"]');


    if (togglePassword && password) {
        togglePassword.addEventListener('click', function () {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';

            password.setAttribute('type', type);

            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });

    }
});

// noteroom-auth handler
document.querySelector('.primary-btn').addEventListener('click', function () {
    let email = document.querySelector('input[name="email"]').value
    let password = document.querySelector('input[name="password"]').value
    let loginSpinner = document.querySelector('#login-spinner')
    
    if (email.trim() !== "" && password.trim() !== "") {
        let formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        fetch('/login', {
            method: 'POST',
            body: formData
        }).then(response => { return response.json() })
            .then(data => {
                console.log(data)
                loginSpinner.style.display = 'none'

                data.ok ? window.location.href = data.url :
                    data.field ? setupErrorPopup(`On <b>${data.field}</b>: ${data.field} is not provided`) : false; se
            })
            .catch(error => { console.error(error) })

        loginSpinner.style.display = 'flex'
    }
})
