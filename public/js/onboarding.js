// import {districtCollegeData} from "/js/onboarding-data";

const userOnboarding = {
    district: '',
    collegeId: '',
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

// Function to dynamically load colleges based on the selected district
function loadCollegesForDistrict() {
    const collegeContainer = document.querySelector('.clg-selection-grid');
    collegeContainer.innerHTML = ""; // Clear previous options

    const selectedDistrict = userOnboarding.district;

    if (!selectedDistrict || !districtCollegeData[selectedDistrict]) {
        collegeContainer.innerHTML = "<p>No colleges available for the selected district.</p>";
        return;
    }

    // Generate and append college options
    const colleges = districtCollegeData[selectedDistrict];
    colleges.forEach(college => {
        const collegeHTML = `
            <div class="clg-selection__card flex-col-center" data-college-id="${college.id}">
                <img 
                    class="clg-selection__card--logo"
                    src="images/onboarding-assets/College-logos/${college.logo}" 
                    alt="${college.name}">
                <p class="clg-label">${college.name}</p>
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" class="clg-select-icon" style="display: none;">
                    <g clip-path="url(#clip0_1844_2149)">
                        <circle cx="14" cy="14" r="14" fill="#1D8102"/> <!-- Green circle -->
                        <path d="M20.0564 8.62512L11.744 16.9376L7.94357 13.1371C7.49539 12.689 6.76887 12.689 6.32069 13.1371C5.8726 13.5853 5.8726 14.3118 6.32069 14.76L10.9326 19.3719C11.1567 19.5959 11.4503 19.708 11.744 19.708C12.0377 19.708 12.3314 19.5959 12.5555 19.3719L21.6793 10.2481C22.1274 9.79992 22.1274 9.07339 21.6793 8.62521C21.2311 8.17703 20.5045 8.17703 20.0564 8.62512Z" fill="white"/> <!-- Checkmark -->
                    </g>
                    <defs>
                        <clipPath id="clip0_1844_2149">
                            <rect width="28" height="28" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            </div>
        `;
        collegeContainer.innerHTML += collegeHTML;
    });

    console.log(`Loaded colleges for district: ${selectedDistrict}`);
}

// Function to handle college selection
function handleCollegeSelection() {
    const collegeCards = document.querySelectorAll('.clg-selection__card');
    const continueButton = document.querySelectorAll('.move-section-btn')[1];

    collegeCards.forEach(card => {
        card.addEventListener('click', () => {
            // Deselect any previously selected college
            collegeCards.forEach(card => {
                card.classList.remove('user-selected-clg');
                card.querySelector('.clg-select-icon').style.display = 'none';
            });

            // Select the clicked college
            card.classList.add('user-selected-clg');
            card.querySelector('.clg-select-icon').style.display = 'block';

            // Update userOnboarding with the selected college
            const collegeId = card.getAttribute('data-college-id');
            const collegeName = card.querySelector('.clg-label').textContent;
            userOnboarding.collegeId = collegeId;
            userOnboarding.collegeName = collegeName;
            console.log(`Selected College: ${collegeName}, ID: ${collegeId}`);

            // Enable the second continue button
            continueButton.classList.remove('req-field-not-selected');
        });
    });
}

// Function to handle the second continue button click
function storeCollegeSelection() {
    const continueButton = document.querySelectorAll('.move-section-btn')[1];

    if (continueButton) {
        continueButton.addEventListener('click', () => {
            if (!userOnboarding.collegeName) {
                alert("Please select a college before proceeding.");
                return;
            }

            console.log("User onboarding data:", userOnboarding);
            // Proceed to the next step or functionality
        });
    }
}

// Add event listener to the first "Continue" button to load colleges
if (continueButtons[0]) {
    continueButtons[0].addEventListener('click', () => {
        if (!userOnboarding.district) {
            alert("Please select a district before proceeding.");
            return;
        }

        // Load colleges for the selected district
        loadCollegesForDistrict();

        // Attach event listeners for college selection
        handleCollegeSelection();
    });
}

// Initialize the second "Continue" button functionality
storeCollegeSelection();

