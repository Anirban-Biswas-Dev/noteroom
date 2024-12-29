// ************ Slider Moving Codes ***********

// ************ Improved Slider Transition Logic ***********

// Select necessary elements
const slides = document.querySelectorAll('.slide');
const progressBar = document.querySelector('.progress-bar');
const backButton = document.querySelector('.fa-arrow-left');
const continueButtons = document.querySelectorAll('.move-section-btn');

let currentSlide = 0; // Tracks the current slide index
const totalSlides = slides.length; // Total number of slides

// Function to update the active slide and manage transitions
function updateSlides(newIndex, direction) {
    if (newIndex < 0 || newIndex >= totalSlides) {
        return; // Prevent navigating out of bounds
    }

    const outgoingSlide = slides[currentSlide];
    const incomingSlide = slides[newIndex];

    // Determine direction for transition
    const outgoingTransform = direction === 'next' ? '-20%' : '120%';
    const incomingTransform = direction === 'next' ? '120%' : '-20%';

    // Animate outgoing slide
    outgoingSlide.style.transform = `translateX(${outgoingTransform})`;
    outgoingSlide.style.opacity = '0';
    outgoingSlide.classList.remove('active');
    outgoingSlide.classList.add('exit');

    // Prepare incoming slide
    incomingSlide.style.transform = `translateX(${incomingTransform})`;
    incomingSlide.style.opacity = '0';
    incomingSlide.classList.remove('exit');
    incomingSlide.classList.add('active');

    // Delay opacity for smooth entry effect
    setTimeout(() => {
        incomingSlide.style.transform = 'translateX(0)';
        incomingSlide.style.opacity = '1';
    }, 100);

    // Update the current slide index
    currentSlide = newIndex;

    // Update the progress bar width
    updateProgressBar();
}

// Function to update the progress bar dynamically
function updateProgressBar() {
    const progressPercentage = ((currentSlide + 1) / totalSlides) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

// Event listener for the back button (go to previous slide)
backButton.addEventListener('click', () => {
    updateSlides(currentSlide - 1, 'prev');
});

// Add event listeners to all "Continue" buttons for moving to the next slide
continueButtons.forEach((button) => {
    button.addEventListener('click', () => {
        updateSlides(currentSlide + 1, 'next');
    });
});

// Initialize progress bar on page load
updateProgressBar();
