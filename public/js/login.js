const host = window.location.origin
const socket = io(host)

socket.emit('connection')

function show_warning() {
    document.querySelector('input.email').value = ""
    document.querySelector('input.password').value = ""
    document.querySelector('input.email').style.border = "2px solid red"
    document.querySelector('input.password').style.border = "2px solid red"
}

socket.on('wrong-cred', function() {
    hideLoader(true)
    setupErrorPopup("Sorry! Credentials are not accepted")
    show_warning()
})

socket.on('no-email', function() {
    hideLoader(true)
    setupErrorPopup("Sorry! No student account is associated with that email account")
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

document.querySelector('.login-button').addEventListener('click', function() {
    let email = document.querySelector('.email').value
    let password = document.querySelector('.password').value

    if(email && password) {
        let formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
    
        const style = document.createElement('style')
        style.id = 'temp'
        style.innerHTML = `
            body {
                margin: 0;
                padding: 0;
                width: 100vw;
                height: 100vh;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #07192d;
            }
            `;
        
        fetch('/login', {
            method: 'POST',
            body: formData
        }).then(response => { return response.json() })
            .then(data => { 
                if(data.url) {
                    hideLoader()
                    window.location.href = data.url 
                } else {
                    hideLoader(true)
                    setupErrorPopup(data.message)
                }
            })
            .catch(error => { console.error(error) })
    
        document.head.appendChild(style);
        showLoader()
    }

})

function showLoader() {
    document.querySelector('.login-container').style.display = 'none'
    document.querySelector('.content-loader').style.display = 'block'
}

function hideLoader(restore=false) {
    if(!restore) {
        document.querySelector('.content-loader').style.display = 'none'
    } else {
        document.querySelector('.content-loader').style.display = 'none'
        document.querySelector('.login-container').style.display = 'block'
        document.querySelector('style#temp').remove()
    }
}

