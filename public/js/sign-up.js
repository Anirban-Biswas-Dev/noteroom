const host = window.location.origin
const socket = io(host)

socket.emit('connection')
let loginSpinner = document.querySelector('#login-spinner')

socket.on('duplicate-value', (duplicate_field) => {
    loginSpinner.style.display = 'none'
    Swal.fire({
        icon: 'error',
        title: 'An error occured',
        html: `The <b>${_.capitalize(duplicate_field)}</b> you provided is already in use`,
        showConfirmButton: true
    })
})

// google auth handlerE
function handleCredentialResponse(response) {
    const id_token = response.credential;
    let idData = new FormData()
    idData.append("id_token", id_token)

    fetch("/sign-up/auth/google", {
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
                    html: `Cannot signup right now! Please try again a bit later.`,
                    showConfirmButton: true
                })
            }
        })
        .catch(error => {
            loginSpinner.style.display = 'none'
            Swal.fire({
                icon: 'error',
                title: 'An error occured',
                html: `Cannot signup right now! Please try again a bit later.`,
                showConfirmButton: true
            })
        })

    loginSpinner.style.display = "flex";
}


document.querySelectorAll('.custom__input-field').forEach(inputField => {
    inputField.addEventListener('input', function (e) {
        if (!e.target.value || !inputField.value) {
            document.querySelector('.primary-btn').disabled = true
        } else {
            document.querySelector('.primary-btn').disabled = false
        }
    })
})

// noteroom-auth handler.
document.querySelector('.primary-btn').addEventListener('click', function () {
    let displayName = document.querySelector('input[name="displayname"]').value
    let email = document.querySelector('input[name="email"]').value
    let password = document.querySelector('input[name="password"]').value

    let formData = new FormData()
    formData.append('displayname', displayName)
    formData.append('email', email)
    formData.append('password', password)

    fetch('/sign-up', {
        method: 'POST',
        body: formData
    })
        .then(response => { return response.json() })
        .then(data => {
            if (data.url) {
                window.location.href = data.url
            }

            else if (!data.ok) {
                loginSpinner.style.display = 'none'
                Swal.fire({
                    icon: 'error',
                    title: 'An error occured',
                    html: `Cannot signup right now! Please try again a bit later.`,
                    showConfirmButton: true
                })
            }
        })
        .catch(error => {
            loginSpinner.style.display = 'none'
            Swal.fire({
                icon: 'error',
                title: 'An error occured',
                html: `Cannot signup right now! Please try again a bit later.`,
                showConfirmButton: true
            })
        })

    loginSpinner.style.display = 'flex'
})


const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';

    password.setAttribute('type', type);

    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});


