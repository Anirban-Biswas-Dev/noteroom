const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('connection')

socket.on('duplicate-value', (duplicate_field) => {
    document.querySelector("p#message").innerHTML = `The <b>${duplicate_field}</b> you provided is already in use`
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
    let studentid = document.querySelector('input[name="studentid"]').value
    let rollnumber = document.querySelector('input[name="rollnumber"]').value
    let collegesection = document.querySelector('select[name="collegesection"]').value
    let bio = document.querySelector('textarea[name="bio"]').value
    let collegeyear = document.querySelector('input[name="collegeyear"]').value
    let favouritesubject = document.querySelector('input[name="favouritesubject"]').value
    let notfavsubject = document.querySelector('input[name="notfavsubject"]').value
    let group = document.querySelector('select[name="group"]').value
    let username = document.querySelector('input[name="username"]').value

    let formData = new FormData()
    formData.append('profilepic', profilePic)
    formData.append('displayname', displayName)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('studentid', studentid)
    formData.append('rollnumber', rollnumber)
    formData.append('collegesection', collegesection)
    formData.append('collegeyear', collegeyear)
    formData.append('bio', bio)
    formData.append('favouritesubject', favouritesubject)
    formData.append('notfavsubject', notfavsubject)
    formData.append('group', group)
    formData.append('username', username)

    fetch('/sign-up', {
        method: 'POST',
        body: formData
    }).then(response => { return response.json() })
      .then(data => { 
        if(data.messaqge) console.error(data.message)
        else window.location.href = data.url
       })
      .catch(error => { console.error(error) })
})
