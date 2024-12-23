const host = window.location.origin
const socket = io(host)

socket.emit('connection')

socket.on('duplicate-value', (duplicate_field) => {
    setupErrorPopup(`The <b>${_.capitalize(duplicate_field)}</b> you provided is already in use`)
    document.querySelector('#login-spinner').style.display = "none";
})

// Maybe this sliding thing is not needed anymore as we don't have any multi-page sign-up
// document.addEventListener('DOMContentLoaded', function () {
//     const steps = document.querySelectorAll('.step');
//     const progressBar = document.querySelector('.progress-bar');
//     const messageElement = document.getElementById('step-message');
//     const stepMessages = [
//         "Welcome! Let's get started.",
//         "Fill in your college information.",
//         "Set your academic preferences.",
//         "You're almost done! Just one more step."
//     ];

//     let currentStep = 0;

//     function showStep(stepIndex) {
//         steps.forEach((step, index) => {
//             if (index === stepIndex) {
//                 step.classList.add('active');
//                 step.style.opacity = 0; // Start with hidden opacity
//                 setTimeout(() => {
//                     step.style.opacity = 1; // Fade in
//                 }, 10); // Short delay for transition effect
//             } else {
//                 step.classList.remove('active');
//                 step.style.opacity = 0; // Fade out
//             }
//         });

//         // Update progress bar
//         const totalSteps = steps.length;
//         const progress = ((stepIndex + 1) / totalSteps) * 100;
//         progressBar.style.width = progress + '%';

//         // Update message
//         messageElement.textContent = stepMessages[stepIndex] || "";
//     }

//     document.querySelectorAll('.next-button').forEach(button => {
//         button.addEventListener('click', function () {
//             document.querySelector("p#message").innerHTML = "" // the message portion will be clean
//             if (currentStep < steps.length - 1) {
//                 currentStep++;
//                 showStep(currentStep);
//             }
//         });
//     });

//     document.querySelectorAll('.back-button').forEach(button => {
//         button.addEventListener('click', function () {
//             document.querySelector("p#message").innerHTML = "" // the message portion will be clean
//             if (currentStep > 0) {
//                 currentStep--;
//                 showStep(currentStep);
//             }
//         });
//     });

//     // Initial setup for the first step
//     showStep(currentStep);
// });

// let profile = null
// document.querySelector('#profile-picture').addEventListener('change', function(event) {
//     let profilePic = event.target.files[0]
//     profile = profilePic
//     let profilePreview = document.querySelector('#profile-picture-preview')
//     if(profilePic) {
//         let blobUrl = URL.createObjectURL(profilePic)
//         profilePreview.src = blobUrl
//         document.querySelector('.profile-picture-upload').style.display = 'none';
//         profilePreview.style.display = 'block'
//         profilePreview.onload = function() {
//             URL.revokeObjectURL(profilePreview.src);
//             document.querySelector('.profile-pic-preview-placeholder').style.display = 'flex';
//         }
//     }
// });

// google auth handler
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
    console.log(id_token)
}


// noteroom-auth handler.
document.querySelector('.primary-btn').addEventListener('click', function() {
    let loginSpinner = document.querySelector('#login-spinner')
    // let profilePic = profile
    let displayName = document.querySelector('input[name="displayname"]').value
    let email = document.querySelector('input[name="email"]').value
    let password = document.querySelector('input[name="password"]').value
    // let rollnumber = document.querySelector('input[name="rollnumber"]').value
    // let collegesection = document.querySelector('select[name="collegesection"]').value
    // let bio = document.querySelector('textarea[name="bio"]').value
    // let collegeyear = document.querySelector('select[name="collegeyear"]').value
    // let favouritesubject = document.querySelector('input[name="favouritesubject"]').value
    // let notfavsubject = document.querySelector('input[name="notfavsubject"]').value
    // let group = document.querySelector('select[name="group"]').value
    // let username = document.querySelector('input[name="username"]').value

    // if(!bio) {
    //     let randomBio = [
    //         "Just here to share notes and help others out!",
    //         "Currently exploring all things Noteroom.",
    //         "Learning, sharing, and taking notes like a pro.",
    //         "A student of life, taking notes as I go.",
    //         "Notes? Got 'em. Ready to share!",
    //         "Making studying easier, one note at a time.",
    //         "Using Noteroom to keep my brain organized!",
    //         "Sharing is caring, especially with notes!",
    //         "Here for the notes, staying for the knowledge.",
    //         "Note-taker extraordinaire, happy to be here!"
    //     ]
    //     bio = randomBio[_.random(0, 9)]
    // }

    let formData = new FormData()
    // formData.append('profilepic', profilePic)
    formData.append('displayname', displayName)
    formData.append('email', email)
    formData.append('password', password)
    // formData.append('rollnumber', rollnumber)
    // formData.append('collegesection', collegesection)
    // formData.append('collegeyear', collegeyear)
    // formData.append('bio', bio)
    // formData.append('favouritesubject', favouritesubject)
    // formData.append('notfavsubject', notfavsubject)
    // formData.append('group', group)
    // formData.append('username', username)

    fetch('/sign-up', {
        method: 'POST',
        body: formData
    })
    .then(response => { return response.json() })
    .then(data => { 
        if(data.url) {
            loginSpinner.style.display = 'none'
            window.location.href = data.url
        } else if(data.message) {
            console.log(data)
            loginSpinner.style.display = 'none'
            setupErrorPopup(data.message)
        } else if(data.emptyFields) {
            let { emptyFields, userDefinedErrors } = data
            let message

            if(emptyFields.length > 0 && userDefinedErrors.length === 0) {
                message = `Empty Fields: <b>${emptyFields.join()}</b>`
            } else if(emptyFields.length > 0 && userDefinedErrors.length > 0) {
                message = `
                Empty Fields: <b>${emptyFields.join()}</b><br>
                <b>${_.capitalize(userDefinedErrors[0].fieldName)}</b>: ${userDefinedErrors[0].errorMessage}
                `
            } else if(emptyFields.length === 0 && userDefinedErrors.length > 0) {
                message = `<b>${_.capitalize(userDefinedErrors[0].fieldName)}</b>: ${userDefinedErrors[0].errorMessage}`
            }

                loginSpinner.style.display = 'none'
                setupErrorPopup(message)
        }
    })
    .catch(error => { 
        loginSpinner.style.display = 'none'
        console.error(error) 
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


