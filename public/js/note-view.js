const host = window.location.origin
const socket = io(host)

/*
# Event Sequence:
~   1. join-room: to server : request server to join the room of that note
~   2. feedback: to server : give the feedback and other assoc. data to add the feedbacks to db
~   3. add-feedback: from server : add the responsed extented feedback data with commenter's information   
*/

socket.emit('join-room', window.location.pathname.split('/')[2] /* The note-id as the unique room name */)

//* Broadcasted feedback handler. The extented-feedback is broadcasted
socket.on('add-feedback', (feedbackData) => {
	manageNotes.addFeedback(feedbackData)
})

const slides = document.querySelectorAll(".carousel-slide");
const nextButton = document.querySelector(".next");
const prevButton = document.querySelector(".prev");
let currentIndex = 0;

function showSlide(index) {
	const offset = -index * 100;
	document.querySelector(
		".carousel-wrapper"
	).style.transform = `translateX(${offset}%)`;
}

nextButton.addEventListener("click", () => {
	currentIndex = (currentIndex + 1) % slides.length;
	showSlide(currentIndex);
});

prevButton.addEventListener("click", () => {
	currentIndex = (currentIndex - 1 + slides.length) % slides.length;
	showSlide(currentIndex);
});

// Initially show the first slide
showSlide(currentIndex);

try {
    let feedback = document.querySelector('textarea[name="feedbackText"]')
    let noteDocID = window.location.pathname.split('/')[2] // Note's document ID
    let commenterStudentID = Cookies.get('studentID') // Commenter's document ID

    async function postFeedback() {
        if(feedback.value.trim() !== "") {
            socket.emit('feedback', 
                noteDocID, // room-name (unique noteDocID) 
                feedback.value, // feedback-text 
                noteDocID, // noteid 
                commenterStudentID // commenter's student ID
            ) 
            document.querySelector('textarea[name="feedbackText"]').value = ''
        }
	}

    let postBtn = document.querySelector('.post-feedback')
	postBtn.addEventListener('click', postFeedback)
} catch (error) {
	console.log(error.message)
}

let kickUser = document.querySelector('.kick')
if(kickUser) {
	setTimeout(() => {
		alert('You are kicked out of noteroom cause you are not a user of it, cry about it or signup')
		kickUser.click()
	}, 3000)
}


// Custom smooth scrolling function
/*
PROCESS EXPLANATION:

1. When the DOM is fully loaded, the script waits for the hash part of the URL (anything after `#`).
2. If a hash is found, the script extracts the part after `#` and checks if there's an element on the page with the same ID.
3. If the ID corresponds to an element (either a generic section like "#feedbacks" or a dynamic ID), it triggers a smooth scroll animation.
4. The smooth scroll smoothly moves the page to the target element over a specified duration.
5. After the scroll is complete, a highlight effect is applied to the element.
6. For "#feedbacks", the element is highlighted with a grayish shade (`#F0F0F0`).
7. For other dynamically generated IDs, the element is highlighted with a yellow shade (`#FFD700`).
8. The highlight is done through a subtle blinking effect, where the element changes its background color a few times before returning to the original color.

*/

document.addEventListener("DOMContentLoaded", function () {
    // 1
    const hash = window.location.hash; // 2

    if (hash) {
        const rawHash = hash.substring(1); // 2

        const section = document.getElementById(rawHash); // 3

        if (section) {
            if (rawHash === "feedbacks") {
                // 6
                smoothScrollTo(section, 1000, 100, () => highlightSection(section, '#F0F0F0'));
            } else {
                // 7 
                smoothScrollTo(section, 1000, 100, () => highlightSection(section, '#fffdaf'));
            }
        }
    }
});

// Function for smooth scrolling animation
function smoothScrollTo(element, duration = 1000, offset = 100, callback = null) {
    const targetPosition = element.getBoundingClientRect().top - offset; // 4
    const startPosition = window.pageYOffset;
    const distance = targetPosition;
    let startTime = null;

    function animationScroll(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);

        if (timeElapsed < duration) {
            requestAnimationFrame(animationScroll);
        } else {
            if (callback) callback(); // Step 5: 
        }
    }

    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animationScroll);
}

// Function to highlight the section with a blink effect
function highlightSection(element, highlightColor = '#F0F0F0') {
    const originalColor = getComputedStyle(element).backgroundColor; // 5

    element.style.transition = 'background-color 0.3s ease'; 

    // First blink (highlight color)
    element.style.backgroundColor = highlightColor;

    setTimeout(() => {
        // Second blink (back to original)
        element.style.backgroundColor = originalColor;

        setTimeout(() => {
            // Final highlight (highlight color)
            element.style.backgroundColor = highlightColor;

            setTimeout(() => {
                // Return to the original color
                element.style.backgroundColor = originalColor;
            }, 300); 
        }, 300); 
    }, 300); 
}
