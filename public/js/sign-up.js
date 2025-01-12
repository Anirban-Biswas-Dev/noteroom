const host = window.location.origin
const socket = io(host)

socket.emit('connection')

socket.on('duplicate-value', (duplicate_field) => {
    setupErrorPopup(`The <b>${_.capitalize(duplicate_field)}</b> you provided is already in use`)
    document.querySelector('#login-spinner').style.display = "none";
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
            data.message ? setupErrorPopup(data.message) : data.redirect ? window.location.href = data.redirect : ""
        })
        .catch(error => setupErrorPopup(error.message))

    document.querySelector('#login-spinner').style.display = "flex";
}


// noteroom-auth handler.
document.querySelector('.primary-btn').addEventListener('click', function () {
    let loginSpinner = document.querySelector('#login-spinner')
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
                loginSpinner.style.display = 'none'
                window.location.href = data.url
            }

            else if (!data.ok) {
                loginSpinner.style.display = 'none'

                data.message ? (function() {
                    setupErrorPopup(data.message)
                })() : data.error ? (function() {
                    setupErrorPopup(`On <b>${data.error.fieldName}</b>: ${data.error.errorMessage}`)
                })() : false
            }
        })
        .catch(error => {
            loginSpinner.style.display = 'none'
            setupErrorPopup(error)
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


