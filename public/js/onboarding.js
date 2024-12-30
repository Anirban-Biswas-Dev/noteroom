
const userOnboarding = {
    district: '',
    collegeName: '',
    collegeYear: '',
    collegeRoll: '',
    group: '',
    favSub: '',
    nonFavSub:''
}



// ************ Slider Moving Codes ***********

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


/**
 * Initializes the district selection functionality.
 * Ensures only one option is selected at a time and updates the global userOnboarding object.
 * Manages the activation state of the first "move section" button for the district selection.
 */
function initializeDistrictSelection() {
    const options = document.querySelectorAll('.college-option');
    const continueButtons = document.querySelectorAll('.move-section-btn');

    // Initially disable all continue buttons
    continueButtons.forEach(button => button.classList.add('req-field-not-selected'));

    // Add event listeners to each district option for selection/deselection
    options.forEach(option => {
        option.addEventListener('click', () => {
            // Remove the selected state from all options
            options.forEach(opt => opt.classList.remove('clg-selected'));

            // Add the selected state to the clicked option
            option.classList.add('clg-selected');

            // Update the global userOnboarding object with the selected district
            const selectedDistrict = option.querySelector('.clg-label').innerText;
            userOnboarding.district = selectedDistrict;

            // Update the UI to show the correct checkmark visibility
            options.forEach(opt => {
                const checkmark = opt.querySelector('.clg-opt-checkmark');
                checkmark.style.display = opt.classList.contains('clg-selected') ? 'block' : 'none';
            });

            // Enable only the first continue button
            continueButtons[0].classList.remove('req-field-not-selected');

            // Detailed logs for debugging
            console.log('District Selected:', userOnboarding.district);
            console.log('Updated userOnboarding Object:', userOnboarding);
        });
    });

    // Add event listeners to all move section buttons
    continueButtons.forEach((button, index) => {
        button.addEventListener('click', (event) => {
            // Prevent action if the button is inactive
            if (button.classList.contains('req-field-not-selected')) {
                event.preventDefault();
                console.log(`Button ${index} is inactive. Cannot proceed.`);
                alert('Please complete the required field before proceeding.');
                return;
            }

            // Log for when the button is active and clicked
            console.log(`Button ${index} clicked. Proceeding to the next section.`);
            console.log('Current userOnboarding Object:', userOnboarding);

            const tokiClgQtn = document.getElementById('tokiClgQtn')
            tokiClgQtn.textContent = `Which college in ${userOnboarding.district} do you attend?` 
        });
    });
}

// Initialize the functionality
initializeDistrictSelection();


/**
 * Disables all buttons with the 'req-field-not-selected' class.
 * Ensures no actions are triggered on these buttons.
 */
function initializeButtonDisabling() {
    const buttons = document.querySelectorAll('.move-section-btn');

    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            if (button.classList.contains('req-field-not-selected')) {
                event.preventDefault(); // Prevent default behavior
                event.stopPropagation(); // Stop further event propagation
                console.log('Button is disabled. Action blocked.');
            }
        });
    });
}

// Initialize the disabling functionality
initializeButtonDisabling();


