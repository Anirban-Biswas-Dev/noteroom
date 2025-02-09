const host = window.location.origin
const socket = io(host)

let loginSpinner = document.querySelector('#login-spinner')

socket.on('wrong-cred', function () {
    loginSpinner.style.display = "none"
    Swal.fire({
        icon: 'error',
        title: 'An error occured',
        text: "Sorry! Credentials are not accepted",
        showConfirmButton: true
    })
})

socket.on('no-email', function () {
    loginSpinner.style.display = "none"
    Swal.fire({
        icon: 'error',
        title: 'An error occured',
        text: "Sorry! No student account is associated with that email account",
        showConfirmButton: true
    })
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
            if (data.redirect) {
                window.location.href = data.redirect
            } else {
                loginSpinner.style.display = 'none'
                Swal.fire({
                    icon: 'error',
                    title: 'An error occured',
                    text: data.message,
                    showConfirmButton: true
                })
            }
        })
        .catch(error => (function () {
            loginSpinner.style.display = 'none'
            Swal.fire({
                icon: 'error',
                title: 'An error occured',
                text: "Sorry! Something went wrong with the server. Please try again a bit later!",
                showConfirmButton: true
            })
        })())

    loginSpinner.style.display = "flex";
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
    
    if (email.trim() !== "" && password.trim() !== "") {
        let formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        fetch('/login', {
            method: 'POST',
            body: formData
        })
            .then(response => { return response.json() })
            .then(data => {
                if (data.ok) {
                    window.location.href = data.url
                } else {
                    loginSpinner.style.display = 'none'
                    Swal.fire({
                        icon: 'error',
                        title: 'An error occured',
                        html: `On <b>${data.field}</b>: ${data.field} is not provided`,
                        showConfirmButton: true
                    })
                }
            })
            .catch(error => { 
                loginSpinner.style.display = 'none'
                Swal.fire({
                    icon: 'error',
                    title: 'An error occured',
                    text: 'Sorry! Cannot log you in right now. Try again a bit later.',
                    showConfirmButton: true
                })
            })

        loginSpinner.style.display = 'flex'
    }
})
