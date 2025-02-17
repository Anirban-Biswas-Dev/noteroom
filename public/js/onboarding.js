const userOnboarding = {
  district: null, //! Required
  collegeId: null, //! Required
  collegeYear: null,
  collegeRoll: null,
  group: null, //! Required
  bio: null,
  favSub: null, //! Required
  nonFavSub: null, //! Required
  profilePic: null
};


// ************ Slider Moving Codes ***********

// Select necessary elements
const slides = document.querySelectorAll(".slide");
const progressBar = document.querySelector(".progress-bar");
const backButton = document.querySelector(".arrow-left-icon");
const continueButtons = document.querySelectorAll(".move-section-btn");

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
  const outgoingTransform = direction === "next" ? "-20%" : "120%";
  const incomingTransform = direction === "next" ? "120%" : "-20%";

  // Animate outgoing slide
  outgoingSlide.style.transform = `translateX(${outgoingTransform})`;
  outgoingSlide.style.opacity = "0";
  outgoingSlide.classList.remove("active");
  outgoingSlide.classList.add("exit");

  // Prepare incoming slide
  incomingSlide.style.transform = `translateX(${incomingTransform})`;
  incomingSlide.style.opacity = "0";
  incomingSlide.classList.remove("exit");
  incomingSlide.classList.add("active");

  // Delay opacity for smooth entry effect
  setTimeout(() => {
    incomingSlide.style.transform = "translateX(0)";
    incomingSlide.style.opacity = "1";
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
backButton.addEventListener("click", async () => {
  let isFirstSlide = document.querySelector('#slide-1').classList.contains('active')
  if (isFirstSlide) {
		let result = await Swal.fire({
        icon: 'warning',
        title: 'Are you sure you want to exit?',
        text: 'If you leave now, your account and progress will be deleted. You’ll need to start over if you return. Would you like to continue onboarding instead?',

        showConfirmButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: 'Exit Anyway',

        showCancelButton: true,
        cancelButtonColor: "#3085d6",
        cancelButtonText: 'Continue Onboarding',

        focusCancel: true,
    })

    if (result.isConfirmed) {
      try {
        let response = await fetch('/api/user/delete')
        let data = await response.json()
        if (data.ok) {
          window.location.href = '/'
        } else {
          Swal.fire({
            title: '<svg fill="#000000" width="70px" height="70px" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 10c.277 0 .5.223.5.5v3c0 .277-.223.5-.5.5s-.5-.223-.5-.5v-3c0-.277.223-.5.5-.5zm-9 0c.277 0 .5.223.5.5v3c0 .277-.223.5-.5.5s-.5-.223-.5-.5v-3c0-.277.223-.5.5-.5zM15 20c-2.104 0-4.186.756-5.798 2.104-.542.4.148 1.223.638.76C11.268 21.67 13.137 21 15 21s3.732.67 5.16 1.864c.478.45 1.176-.364.638-.76C19.186 20.756 17.104 20 15 20zm0-20C6.722 0 0 6.722 0 15c0 8.278 6.722 15 15 15 8.278 0 15-6.722 15-15 0-8.278-6.722-15-15-15zm0 1c7.738 0 14 6.262 14 14s-6.262 14-14 14S1 22.738 1 15 7.262 1 15 1z" stroke-width="3"/></svg>',
            text: "Couldn't delete your account! Please try again a bit later.",
            showConfirmButton: true,
            confirmButtonText: 'OK',
          })
        }
      } catch (error) {
        Swal.fire({
          title: `<svg width="70px" height="70px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="m 1.53125 0.46875 l -1.0625 1.0625 l 14 14 l 1.0625 -1.0625 l -6.191406 -6.191406 c 0.546875 0.175781 1.042968 0.46875 1.421875 0.886718 l 0.5 0.542969 c 0.175781 0.199219 0.425781 0.316407 0.691406 0.328125 c 0.265625 0.015625 0.523437 -0.078125 0.722656 -0.257812 c 0.195313 -0.179688 0.3125 -0.429688 0.324219 -0.695313 c 0.011719 -0.261719 -0.082031 -0.523437 -0.261719 -0.71875 l -0.5 -0.546875 c -1.121093 -1.234375 -2.703125 -1.828125 -4.269531 -1.816406 c -0.28125 0.003906 -0.5625 0.027344 -0.839844 0.066406 l -1.671875 -1.671875 c 2.859375 -0.839843 6.183594 -0.222656 8.351563 1.851563 l 0.5 0.476562 c 0.398437 0.378906 1.03125 0.367188 1.414062 -0.03125 c 0.378906 -0.398437 0.367188 -1.03125 -0.03125 -1.410156 l -0.496094 -0.480469 c -1.957031 -1.875 -4.578124 -2.808593 -7.195312 -2.808593 c -1.410156 0 -2.820312 0.273437 -4.125 0.820312 z m -0.230469 3.894531 c -0.167969 0.140625 -0.335937 0.28125 -0.496093 0.4375 l -0.496094 0.480469 c -0.3984378 0.378906 -0.410156 1.011719 -0.03125 1.410156 c 0.382812 0.398438 1.015625 0.410156 1.414062 0.03125 l 0.5 -0.476562 c 0.171875 -0.164063 0.347656 -0.316406 0.535156 -0.460938 z m 2.96875 2.964844 c -0.179687 0.148437 -0.347656 0.3125 -0.507812 0.484375 l -0.5 0.550781 c -0.179688 0.195313 -0.277344 0.453125 -0.261719 0.71875 c 0.011719 0.265625 0.128906 0.515625 0.324219 0.695313 c 0.199219 0.179687 0.457031 0.273437 0.722656 0.257812 c 0.265625 -0.011718 0.515625 -0.128906 0.691406 -0.328125 l 0.5 -0.546875 c 0.136719 -0.148437 0.292969 -0.28125 0.460938 -0.402344 z m 2.867188 2.871094 c -0.199219 0.09375 -0.386719 0.222656 -0.550781 0.386719 c -0.78125 0.78125 -0.78125 2.046874 0 2.828124 s 2.046874 0.78125 2.828124 0 c 0.164063 -0.164062 0.292969 -0.351562 0.386719 -0.550781 z m 0 0" fill="#2e3436"/></svg>`,
          text: "Couldn't onboard you currectly!! Maybe check your internet conection.",
          showConfirmButton: true,
          confirmButtonText: 'OK',
        })
      }
    }  
  }

  updateSlides(currentSlide - 1, "prev");
});

// Add event listeners to all "Continue" buttons for moving to the next slide
continueButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateSlides(currentSlide + 1, "next");
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
  const options = document.querySelectorAll(".dist-option");

  // Initially disable all continue buttons
  continueButtons.forEach((button) =>
    button.classList.add("req-field-not-selected")
  );

  // Add event listeners to each district option for selection/deselection
  options.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove the selected state from all options
      options.forEach((opt) => opt.classList.remove("dist-selected"));

      // Add the selected state to the clicked option
      option.classList.add("dist-selected");

      // Update the global userOnboarding object with the selected district
      const selectedDistrict = option.querySelector(".dist-label").innerText;
      userOnboarding.district = selectedDistrict;

      // Update the UI to show the correct checkmark visibility
      options.forEach((opt) => {
        const checkmark = opt.querySelector(".dist-opt-checkmark");
        checkmark.style.display = opt.classList.contains("dist-selected")
          ? "block"
          : "none";
      });

      // Enable only the first continue button
      if (userOnboarding.district) {
        continueButtons[0].classList.remove("req-field-not-selected");
        continueButtons[0].disabled = false
      }

      // Detailed logs for debugging
      //console.log("District Selected:", userOnboarding.district);
      //console.log("Updated userOnboarding Object:", userOnboarding);
    });
  });

  // Add event listeners to all move section buttons
  continueButtons.forEach((button, index) => {
    button.addEventListener("click", (event) => {
      // Prevent action if the button is inactive
      if (button.classList.contains("req-field-not-selected")) {
        event.preventDefault();
      }

      const tokiClgQtn = document.getElementById("tokiClgQtn");
      tokiClgQtn.textContent = `Which college in ${userOnboarding.district} do you attend?`;
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
  const buttons = document.querySelectorAll(".move-section-btn");

  buttons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (button.classList.contains("req-field-not-selected")) {
        event.preventDefault(); // Prevent default behavior
        event.stopPropagation(); // Stop further event propagation
        //console.log("Button is disabled. Action blocked.");
      }
    });
  });
}

// Initialize the disabling functionality
initializeButtonDisabling();

// Function to dynamically load colleges based on the selected district
function loadCollegesForDistrict() {
  const collegeContainer = document.querySelector(".clg-selection-grid");
  collegeContainer.innerHTML = ""; // Clear previous options

  const selectedDistrict = userOnboarding.district;

  // Generate and append college options
  const colleges = districtCollegeData[selectedDistrict];
  colleges.forEach((college) => {
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

  //console.log(`Loaded colleges for district: ${selectedDistrict}`);
}

// Function to handle college selection
function handleCollegeSelection() {
  const collegeCards = document.querySelectorAll(".clg-selection__card");
  const otherInputField = document.getElementById("other-college");
  const continueButton = document.querySelectorAll(".move-section-btn")[1];

  // Enable mutual exclusivity for college cards and the "Other" input
  collegeCards.forEach((card) => {
    card.addEventListener("click", () => {
      // Deselect "Other" input if a college is selected
      otherInputField.value = "";
      otherInputField.removeAttribute("disabled"); // Ensure the input is enabled for future use
      userOnboarding.collegeName = ""; // Clear any previously entered other college name

      // Deselect any previously selected college
      collegeCards.forEach((card) => {
        card.classList.remove("user-selected-clg");
        card.querySelector(".clg-select-icon").style.display = "none";
      });

      // Select the clicked college
      card.classList.add("user-selected-clg");
      card.querySelector(".clg-select-icon").style.display = "block";

      // Update userOnboarding with the selected college
      const collegeId = card.getAttribute("data-college-id");
      const collegeName = card.querySelector(".clg-label").textContent;
      userOnboarding.collegeId = collegeId;
      userOnboarding.collegeName = collegeName;

      //console.log(`Selected College: ${collegeName}, ID: ${collegeId}`);

      // Enable the second continue button
      continueButton.classList.remove("req-field-not-selected");
      continueButton.disabled = false
    });
  });

  // Handle "Other" input field focus and typing
  otherInputField.addEventListener("input", () => {
    const otherCollegeName = otherInputField.value.trim();

    if (otherCollegeName) {
      // Deselect all college cards if "Other" is being filled
      collegeCards.forEach((card) => {
        card.classList.remove("user-selected-clg");
        card.querySelector(".clg-select-icon").style.display = "none";
      });

      // Update userOnboarding with the "Other" college name
      userOnboarding.collegeId = null; // Clear any selected college ID
      userOnboarding.collegeName = otherCollegeName;

      //console.log(`Entered Other College: ${otherCollegeName}`);

      // Enable the second continue button
      continueButton.classList.remove("req-field-not-selected");
      continueButton.disabled = false
    } else {
      // If "Other" input is cleared, disable the continue button again
      userOnboarding.collegeName = "";
      continueButton.classList.add("req-field-not-selected");
      continueButton.disabled = true
    }
  });

  // Ensure the "Other" input field is always enabled and focusable
  otherInputField.addEventListener("focus", () => {
    otherInputField.removeAttribute("disabled"); // Ensure the input can be focused
  });
}

// Function to handle the second continue button click
function storeCollegeSelection() {
  const continueButton = document.querySelectorAll(".move-section-btn")[1];

  if (continueButton) {
    continueButton.addEventListener("click", () => {
      if (!userOnboarding.collegeName) {
        return;
      }

      // Proceed to the next step or functionality
    });
  }
}

// Example: Attach event listener to the first "Continue" button to load colleges
if (continueButtons[0]) {
  continueButtons[0].addEventListener("click", () => {
    if (!userOnboarding.district) {
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

// Function to handle group, year, and roll number inputs for this slide
function handleGroupYearRollSelection() {
  const groupDropdown = document.querySelector("#img_category_options"); // Group dropdown options
  const yearDropdown = document.querySelectorAll("#img_category_options")[1]; // Year dropdown options
  const rollInputField = document.getElementById("college-roll"); // Roll number input field
  const continueButton = document.querySelectorAll(".move-section-btn")[2]; // Third slide's continue button

  let groupSelected = false;

  // Handle group dropdown selection
  groupDropdown.addEventListener("click", (e) => {
    if (e.target.classList.contains("dropdown-option")) {
      const groupValue = e.target.getAttribute("data-value");
      userOnboarding.group = groupValue; // Push group value to the onboarding object
      document.querySelector("#img_category .selected").textContent = groupValue; // Update selected text
      groupSelected = true;
      continueButton.classList.remove("req-field-not-selected");
      continueButton.disabled = false
    }
  });

  // Handle year dropdown selection
  yearDropdown.addEventListener("click", (e) => {
    if (e.target.classList.contains("dropdown-option")) {
      const yearValue = e.target.getAttribute("data-value");
      userOnboarding.collegeYear = yearValue; // Push year value to the onboarding object
      document.querySelectorAll("#img_category .selected")[1].textContent = yearValue; // Update selected text for year
    }
  });

  // Handle roll number input
  rollInputField.addEventListener("input", () => {
    const rollValue = rollInputField.value.trim();
    userOnboarding.collegeRoll = rollValue === "" ? null : rollValue; // Push roll value to the onboarding object
  });

  // Initialize the continue button click logic
  continueButton.addEventListener("click", () => {
    if (!groupSelected) return
    // Placeholder for next-step logic
  });
}

// Call the function to attach the event listeners for this slide
handleGroupYearRollSelection();

function adjustHeight(element) {
  element.style.height = "auto"; // Reset height to recalculate
  element.style.height = element.scrollHeight + "px"; // Adjust height to fit content
}

function updateCharCount(element) {
  const maxLength = element.maxLength;
  const currentLength = element.value.length;
  const charCount = document.getElementById("charCount");
  charCount.textContent = `${maxLength - currentLength}/200`;

  // show visually the red color if bio is bigger than 170 chars

  if (maxLength - currentLength <= 30) {
    charCount.style.color = "#FF3333";
  } else {
    charCount.style.color = "#000000";
  }
}

// Function to load subjects dynamically based on the user's group
function loadSubjects() {
  const subjectContainer = document.querySelector(".subj-selection-grid"); // Container for subject cards
  subjectContainer.innerHTML = ""; // Clear any previously loaded subjects

  const group = userOnboarding.group; // Get the user's group from onboarding data

  if (!group || !subjectsData[group]) {
    console.error("Invalid or missing group. Cannot load subjects.");
    subjectContainer.innerHTML = "<p>No subjects available for your group.</p>"; // Fallback message
    return;
  }

  // Combine general subjects and group-specific subjects
  const subjectsToLoad = [...subjectsData[group], ...subjectsData.general];

  // Generate and append subject cards
  subjectsToLoad.forEach((subject) => {
    const subjectHTML = `
            <div class="subj-selection__card flex-col-center">
                <img 
                    class="subj-selection__card--logo" 
                    src="/images/onboarding-assets/subjects/${subject.icon}" 
                    alt="${subject.name}">
                <p class="subj-label">${subject.name}</p>
            </div>
        `;
    subjectContainer.innerHTML += subjectHTML;
  });

  //console.log(`Loaded subjects for group: ${group}`);

  handleSubjectAndBioSelection();
}

// Attach the loading function to the third "Continue" button
if (continueButtons[2]) {
  continueButtons[2].addEventListener("click", () => {
    loadSubjects();
  });
}

function handleSubjectAndBioSelection() {
  const subjectCards = document.querySelectorAll(".subj-selection__card");
  const bioTextarea = document.getElementById("userBio"); // Textarea for bio input
  const continueButton = document.querySelectorAll(".move-section-btn")[3]; // Fourth slide's continue button

  let favSubjectSelected = false;
  let nonFavSubjectSelected = false;

  // Function to update the continue button state
  function updateContinueButton() {
    if (favSubjectSelected && nonFavSubjectSelected) {
      continueButton.classList.remove("req-field-not-selected");
      continueButton.disabled = false
    } else {
      continueButton.classList.add("req-field-not-selected");
      continueButton.disabled = true
    }
  }

  // Function to clear all subject selections
  function clearAllSelections() {
    subjectCards.forEach((card) => {
      card.classList.remove("selected-fav-subj");
      card.classList.remove("selected-non-fav-subj");
    });
    userOnboarding.favSub = null;
    userOnboarding.nonFavSub = null;
    favSubjectSelected = false;
    nonFavSubjectSelected = false;
    //console.log("All selections cleared. Start fresh.");
  }

  // Subject selection handling
  subjectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const subjectName = card.querySelector(".subj-label").textContent;

      if (!favSubjectSelected) {
        // If no favorite is selected, mark this as favorite
        card.classList.add("selected-fav-subj");
        userOnboarding.favSub = subjectName;
        favSubjectSelected = true;
        console.log(`Favorite Subject Selected: ${subjectName}`);
      } else if (
        !nonFavSubjectSelected &&
        !card.classList.contains("selected-fav-subj")
      ) {
        // If favorite is already selected, mark this as non-favorite
        card.classList.add("selected-non-fav-subj");
        userOnboarding.nonFavSub = subjectName;
        nonFavSubjectSelected = true;
        console.log(`Non-Favorite Subject Selected: ${subjectName}`);
      } else {
        // If both favorite and non-favorite are selected, restart selection
        clearAllSelections();

        // Mark the clicked subject as favorite
        card.classList.add("selected-fav-subj");
        userOnboarding.favSub = subjectName;
        favSubjectSelected = true;
      }

      // Update the continue button state
      updateContinueButton();
    });
  });

  // Bio input handling
  bioTextarea.addEventListener("input", (event) => {
    adjustHeight(event.target); // Adjust the height dynamically
    updateCharCount(event.target); // Update character count
    updateContinueButton(); // Check if all conditions are met for enabling the continue button
  });

  // Handle the continue button click
  continueButton.addEventListener("click", async () => {
    if (!favSubjectSelected || !nonFavSubjectSelected) {
      return;
    }

    // Store bio in the onboarding object
    userOnboarding.bio = bioTextarea.value.trim() === "" ? null : bioTextarea.value.trim()

    console.log(userOnboarding)
    let onboardData = new FormData()
    Object.entries(userOnboarding).forEach(entry => {
      onboardData.append(entry[0], entry[1])
    })

    const onboardLoader = document.querySelector('div#onboard-loader')
    function onboardLoaderToggle(state) {
      onboardLoader.style.display = state ? 'flex' : 'none'
      continueButton.style.display = state ? 'none' : 'flex'
    }
    onboardLoaderToggle(true)

    try {
      let response = await fetch('/sign-up/onboard', {
        body: onboardData,
        method: 'post'
      })
      let data = await response.json()
      if (data.ok) {
        window.location.href = '/dashboard'
      } else {
        Swal.fire({
          title: '<svg fill="#000000" width="70px" height="70px" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 10c.277 0 .5.223.5.5v3c0 .277-.223.5-.5.5s-.5-.223-.5-.5v-3c0-.277.223-.5.5-.5zm-9 0c.277 0 .5.223.5.5v3c0 .277-.223.5-.5.5s-.5-.223-.5-.5v-3c0-.277.223-.5.5-.5zM15 20c-2.104 0-4.186.756-5.798 2.104-.542.4.148 1.223.638.76C11.268 21.67 13.137 21 15 21s3.732.67 5.16 1.864c.478.45 1.176-.364.638-.76C19.186 20.756 17.104 20 15 20zm0-20C6.722 0 0 6.722 0 15c0 8.278 6.722 15 15 15 8.278 0 15-6.722 15-15 0-8.278-6.722-15-15-15zm0 1c7.738 0 14 6.262 14 14s-6.262 14-14 14S1 22.738 1 15 7.262 1 15 1z" stroke-width="3"/></svg>',
          text: "Couldn't onboard you currectly!! Please try again a bit later",
          showConfirmButton: true,
          confirmButtonText: 'OK',
        }).then(result => {
          if (result.isConfirmed) {
            onboardLoaderToggle(false)
          }
        })
      }
    } catch (error) {
        Swal.fire({
          title: `<svg width="70px" height="70px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="m 1.53125 0.46875 l -1.0625 1.0625 l 14 14 l 1.0625 -1.0625 l -6.191406 -6.191406 c 0.546875 0.175781 1.042968 0.46875 1.421875 0.886718 l 0.5 0.542969 c 0.175781 0.199219 0.425781 0.316407 0.691406 0.328125 c 0.265625 0.015625 0.523437 -0.078125 0.722656 -0.257812 c 0.195313 -0.179688 0.3125 -0.429688 0.324219 -0.695313 c 0.011719 -0.261719 -0.082031 -0.523437 -0.261719 -0.71875 l -0.5 -0.546875 c -1.121093 -1.234375 -2.703125 -1.828125 -4.269531 -1.816406 c -0.28125 0.003906 -0.5625 0.027344 -0.839844 0.066406 l -1.671875 -1.671875 c 2.859375 -0.839843 6.183594 -0.222656 8.351563 1.851563 l 0.5 0.476562 c 0.398437 0.378906 1.03125 0.367188 1.414062 -0.03125 c 0.378906 -0.398437 0.367188 -1.03125 -0.03125 -1.410156 l -0.496094 -0.480469 c -1.957031 -1.875 -4.578124 -2.808593 -7.195312 -2.808593 c -1.410156 0 -2.820312 0.273437 -4.125 0.820312 z m -0.230469 3.894531 c -0.167969 0.140625 -0.335937 0.28125 -0.496093 0.4375 l -0.496094 0.480469 c -0.3984378 0.378906 -0.410156 1.011719 -0.03125 1.410156 c 0.382812 0.398438 1.015625 0.410156 1.414062 0.03125 l 0.5 -0.476562 c 0.171875 -0.164063 0.347656 -0.316406 0.535156 -0.460938 z m 2.96875 2.964844 c -0.179687 0.148437 -0.347656 0.3125 -0.507812 0.484375 l -0.5 0.550781 c -0.179688 0.195313 -0.277344 0.453125 -0.261719 0.71875 c 0.011719 0.265625 0.128906 0.515625 0.324219 0.695313 c 0.199219 0.179687 0.457031 0.273437 0.722656 0.257812 c 0.265625 -0.011718 0.515625 -0.128906 0.691406 -0.328125 l 0.5 -0.546875 c 0.136719 -0.148437 0.292969 -0.28125 0.460938 -0.402344 z m 2.867188 2.871094 c -0.199219 0.09375 -0.386719 0.222656 -0.550781 0.386719 c -0.78125 0.78125 -0.78125 2.046874 0 2.828124 s 2.046874 0.78125 2.828124 0 c 0.164063 -0.164062 0.292969 -0.351562 0.386719 -0.550781 z m 0 0" fill="#2e3436"/></svg>`,
          text: "Couldn't onboard you currectly!! Maybe check your internet conection.",
          showConfirmButton: true,
          confirmButtonText: 'OK',
        }).then(result => {
          if (result.isConfirmed) {
            onboardLoaderToggle(false)
          }
        })
    }
    
    // Placeholder for next-step logic
  });

  // Initialize the continue button state
  updateContinueButton();
}

// These are some template codes, I am also not this horrible js writer :)

////////////////////////////////////
// prerequisite utility functions //
// the real stuff starts below    //
////////////////////////////////////
var util = {
    f: {
      addStyle: function (elem, prop, val, vendors) {
        var i, ii, property, value;
        if (!util.f.isElem(elem)) {
          elem = document.getElementById(elem);
        }
        if (!util.f.isArray(prop)) {
          prop = [prop];
          val = [val];
        }
        for (i = 0; i < prop.length; i += 1) {
          var thisProp = String(prop[i]),
            thisVal = String(val[i]);
          if (typeof vendors !== "undefined") {
            if (!util.f.isArray(vendors)) {
              vendors.toLowerCase() == "all"
                ? (vendors = ["webkit", "moz", "ms", "o"])
                : (vendors = [vendors]);
            }
            for (ii = 0; ii < vendors.length; ii += 1) {
              elem.style[vendors[i] + thisProp] = thisVal;
            }
          }
          thisProp = thisProp.charAt(0).toLowerCase() + thisProp.slice(1);
          elem.style[thisProp] = thisVal;
        }
      },
      cssLoaded: function (event) {
        var child = util.f.getTrg(event);
        child.setAttribute("media", "all");
      },
      events: {
        cancel: function (event) {
          util.f.events.prevent(event);
          util.f.events.stop(event);
        },
        prevent: function (event) {
          event = event || window.event;
          event.preventDefault();
        },
        stop: function (event) {
          event = event || window.event;
          event.stopPropagation();
        },
      },
      getSize: function (elem, prop) {
        return parseInt(elem.getBoundingClientRect()[prop], 10);
      },
      getTrg: function (event) {
        event = event || window.event;
        if (event.srcElement) {
          return event.srcElement;
        } else {
          return event.target;
        }
      },
      isElem: function (elem) {
        return util.f.isNode(elem) && elem.nodeType == 1;
      },
      isArray: function (v) {
        return v.constructor === Array;
      },
      isNode: function (elem) {
        return typeof Node === "object"
          ? elem instanceof Node
          : elem &&
              typeof elem === "object" &&
              typeof elem.nodeType === "number" &&
              typeof elem.nodeName === "string" &&
              elem.nodeType !== 3;
      },
      isObj: function (v) {
        return typeof v == "object";
      },
      replaceAt: function (str, index, char) {
        return str.substr(0, index) + char + str.substr(index + char.length);
      },
    },
  },
  //////////////////////////////////////
  // ok that's all the utilities      //
  // onto the select box / form stuff //
  //////////////////////////////////////
  form = {
    f: {
      init: {
        register: function () {
          var child,
            children = document.getElementsByClassName("dropdown-field"),
            i;
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            util.f.addStyle(child, "Opacity", 1);
          }
          children = document.getElementsByClassName("psuedo_select");
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            child.addEventListener("click", form.f.select.toggle);
          }
        },
        unregister: function () {
          //just here as a formallity
          //call this to stop all ongoing timeouts are ready the page for some sort of json re-route
        },
      },
      select: {
        blur: function (field) {
          field.classList.remove("focused");
          var child,
            children = field.childNodes,
            i,
            ii,
            nested_child,
            nested_children;
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            if (util.f.isElem(child)) {
              if (child.classList.contains("deselect")) {
                child.parentNode.removeChild(child);
              } else if (child.tagName == "SPAN") {
                if (!field.dataset.value) {
                  util.f.addStyle(child, ["FontSize", "Top"], ["16px", "32px"]);
                }
              } else if (child.classList.contains("psuedo_select")) {
                nested_children = child.childNodes;
                for (ii = 0; ii < nested_children.length; ii += 1) {
                  nested_child = nested_children[ii];
                  if (util.f.isElem(nested_child)) {
                    if (nested_child.tagName == "SPAN") {
                      if (!field.dataset.value) {
                        util.f.addStyle(
                          nested_child,
                          ["Opacity", "Transform"],
                          [0, "translateY(24px)"]
                        );
                      }
                    } else if (nested_child.tagName == "UL") {
                      util.f.addStyle(
                        nested_child,
                        ["Height", "Opacity"],
                        [0, 0]
                      );
                    }
                  }
                }
              }
            }
          }
        },
        focus: function (field) {
          field.classList.add("focused");
          var bool = false,
            child,
            children = field.childNodes,
            i,
            ii,
            iii,
            nested_child,
            nested_children,
            nested_nested_child,
            nested_nested_children,
            size = 0;
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            util.f.isElem(child) && child.classList.contains("deselect")
              ? (bool = true)
              : null;
          }
          if (!bool) {
            child = document.createElement("div");
            child.className = "deselect";
            child.addEventListener("click", form.f.select.toggle);
            field.insertBefore(child, children[0]);
          }
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            if (
              util.f.isElem(child) &&
              child.classList.contains("psuedo_select")
            ) {
              nested_children = child.childNodes;
              for (ii = 0; ii < nested_children.length; ii += 1) {
                nested_child = nested_children[ii];
                if (
                  util.f.isElem(nested_child) &&
                  nested_child.tagName == "UL"
                ) {
                  size = 0;
                  nested_nested_children = nested_child.childNodes;
                  for (iii = 0; iii < nested_nested_children.length; iii += 1) {
                    nested_nested_child = nested_nested_children[iii];
                    if (
                      util.f.isElem(nested_nested_child) &&
                      nested_nested_child.tagName == "LI"
                    ) {
                      size += util.f.getSize(nested_nested_child, "height");
                      //console.log("size: " + size);
                    }
                  }
                  util.f.addStyle(
                    nested_child,
                    ["Height", "Opacity"],
                    [size + "px", 1]
                  );
                }
              }
            }
          }
        },
        selection: function (child, parent) {
          var children = parent.childNodes,
            i,
            ii,
            nested_child,
            nested_children,
            time = 0,
            value;
          if (util.f.isElem(child) && util.f.isElem(parent)) {
            parent.dataset.value = child.dataset.value;
            value = child.innerHTML;
          }
          for (i = 0; i < children.length; i += 1) {
            child = children[i];
            if (util.f.isElem(child)) {
              if (child.classList.contains("psuedo_select")) {
                nested_children = child.childNodes;
                for (ii = 0; ii < nested_children.length; ii += 1) {
                  nested_child = nested_children[ii];
                  if (
                    util.f.isElem(nested_child) &&
                    nested_child.classList.contains("selected")
                  ) {
                    if (nested_child.innerHTML) {
                      time = 1e2;
                      util.f.addStyle(
                        nested_child,
                        ["Opacity", "Transform"],
                        [0, "translateY(24px)"],
                        "all"
                      );
                    }
                    setTimeout(
                      function (c, v) {
                        c.innerHTML = v;
                        util.f.addStyle(
                          c,
                          ["Opacity", "Transform", "TransitionDuration"],
                          [1, "translateY(0px)", ".1s"],
                          "all"
                        );
                      },
                      time,
                      nested_child,
                      value
                    );
                  }
                }
              } else if (child.tagName == "SPAN") {
                util.f.addStyle(child, ["FontSize", "Top"], ["12px", "8px"]);
              }
            }
          }
        },
        toggle: function (event) {
          util.f.events.stop(event);
          var child = util.f.getTrg(event),
            children,
            i,
            parent;
          switch (true) {
            case child.classList.contains("psuedo_select"):
            case child.classList.contains("deselect"):
              parent = child.parentNode;
              break;
            case child.classList.contains("dropdown-options"):
              parent = child.parentNode.parentNode;
              break;
            case child.classList.contains("dropdown-option"):
              parent = child.parentNode.parentNode.parentNode;
              form.f.select.selection(child, parent);
              break;
          }
          parent.classList.contains("focused")
            ? form.f.select.blur(parent)
            : form.f.select.focus(parent);
        },
      },
    },
  };
window.onload = form.f.init.register;

document.querySelector('#profile-pic-selector').addEventListener('click', function() {
    let imageSelctor = document.querySelector('#profile-picture')
    imageSelctor.click()
})
document.querySelector('#profile-picture').addEventListener('change', function(event) {
    let profilePic = event.target.files[0]
    userOnboarding.profilePic = profilePic
    let selectedProfilePic = document.querySelector('#selected-profile-pic')
    if(profilePic) {
        document.querySelector('#profile-picture-preview').style.display = 'flex'
        document.querySelector('.upload-prfl-pic-box').style.display = 'none'
        let blobUrl = URL.createObjectURL(profilePic)
        selectedProfilePic.src = blobUrl
        selectedProfilePic.onload = function() {
            URL.revokeObjectURL(selectedProfilePic.src);
        }
    }
});
