const host = window.location.origin
const socket = io(host)

socket.emit('connection')

function showError(message) {
    let errorMessage = document.querySelector("p#message")
    setTimeout(() => {
        if(errorMessage) errorMessage.style.display = 'none'    
    }, 5000)
    errorMessage.style.display = 'block'
    errorMessage.innerHTML = message
}

socket.on('duplicate-value', (duplicate_field) => {
    setTimeout(() => {
        hideLoader(true)
        showError(`The <b>${duplicate_field}</b> you provided is already in use`)
    }, 1000)
    document.querySelector(`input[name=${duplicate_field}]`).style.border = "2px solid red"
})

document.addEventListener('DOMContentLoaded', function () {
    const steps = document.querySelectorAll('.step');
    const progressBar = document.querySelector('.progress-bar');
    const messageElement = document.getElementById('step-message');
    const stepMessages = [
        "Welcome! Let's get started.",
        "Fill in your college information.",
        "Set your academic preferences.",
        "You're almost done! Just one more step."
    ];

    let currentStep = 0;

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            if (index === stepIndex) {
                step.classList.add('active');
                step.style.opacity = 0; // Start with hidden opacity
                setTimeout(() => {
                    step.style.opacity = 1; // Fade in
                }, 10); // Short delay for transition effect
            } else {
                step.classList.remove('active');
                step.style.opacity = 0; // Fade out
            }
        });

        // Update progress bar
        const totalSteps = steps.length;
        const progress = ((stepIndex + 1) / totalSteps) * 100;
        progressBar.style.width = progress + '%';

        // Update message
        messageElement.textContent = stepMessages[stepIndex] || "";
    }

    document.querySelectorAll('.next-button').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelector("p#message").innerHTML = "" // the message portion will be clean
            if (currentStep < steps.length - 1) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelector("p#message").innerHTML = "" // the message portion will be clean
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // Initial setup for the first step
    showStep(currentStep);
});

let profile = null
document.querySelector('#profile-picture').addEventListener('change', function(event) {
    let profilePic = event.target.files[0]
    profile = profilePic
    let profilePreview = document.querySelector('#profile-picture-preview')
    if(profilePic) {
        let blobUrl = URL.createObjectURL(profilePic)
        profilePreview.src = blobUrl
        document.querySelector('.profile-picture-upload').style.display = 'none';
        profilePreview.style.display = 'block'
        profilePreview.onload = function() {
            URL.revokeObjectURL(profilePreview.src);
            document.querySelector('.profile-pic-preview-placeholder').style.display = 'flex';
        }
    }
});

document.querySelector('.submit-button').addEventListener('click', function() {
    let profilePic = profile
    let displayName = document.querySelector('input[name="displayname"]').value
    let email = document.querySelector('input[name="email"]').value
    let password = document.querySelector('input[name="password"]').value
    let studentID = document.querySelector('input[name="studentID"]').value
    let rollnumber = document.querySelector('input[name="rollnumber"]').value
    let collegesection = document.querySelector('select[name="collegesection"]').value
    let bio = document.querySelector('textarea[name="bio"]').value
    let collegeyear = document.querySelector('select[name="collegeyear"]').value
    let favouritesubject = document.querySelector('input[name="favouritesubject"]').value
    let notfavsubject = document.querySelector('input[name="notfavsubject"]').value
    let group = document.querySelector('select[name="group"]').value
    let username = document.querySelector('input[name="username"]').value

    let formData = new FormData()
    formData.append('profilepic', profilePic)
    formData.append('displayname', displayName)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('studentID', studentID)
    formData.append('rollnumber', rollnumber)
    formData.append('collegesection', collegesection)
    formData.append('collegeyear', collegeyear)
    formData.append('bio', bio)
    formData.append('favouritesubject', favouritesubject)
    formData.append('notfavsubject', notfavsubject)
    formData.append('group', group)
    formData.append('username', username)

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

    fetch('/sign-up', {
        method: 'POST',
        body: formData
    })
    .then(response => { return response.json() })
    .then(data => { 
        if(data.message) {
            setTimeout(() => {
                hideLoader(true)
                showError(data.message)
            }, 1000)
        } else {
            hideLoader()
            window.location.href = data.url
        }
    })
    .catch(error => { 
        hideLoader(true)
        console.error(error) 
    })
        
    document.head.appendChild(style);
    showLoader()
})

function showLoader() {
    document.querySelector('.signup-container').style.display = 'none'
    document.querySelector('.content-loader').style.display = 'block'
}

function hideLoader(restore=false) {
    if(!restore) {
        document.querySelector('.content-loader').style.display = 'none'
    } else {
        document.querySelector('.content-loader').style.display = 'none'
        document.querySelector('.signup-container').style.display = 'block'
        document.querySelector('style#temp').remove()
    }
}
const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

    togglePassword.addEventListener('click', function () {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        
        password.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });