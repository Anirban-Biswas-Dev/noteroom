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
