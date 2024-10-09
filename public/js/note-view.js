const host = window.location.origin
const socket = io(host)

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
	document.querySelector('.post-feedback').addEventListener('click', async function () {
		let feedback = document.querySelector('textarea[name="feedbackText"]').value // Feedback text
		let ownerUsername = document.querySelector('span.studentusername').innerHTML // Note owner's username
		let noteDocID = window.location.pathname.split('/')[2] // Note's document ID
		let commenterDocID = Cookies.get('recordID').split(':')[1].replaceAll('"', '') // Commenter's document ID
	
		socket.emit('feedback', 
			noteDocID, 
			feedback, 
			noteDocID, 
			commenterDocID, 
			ownerUsername
		) 
		// sending room-name (unique noteDocID), feedback-text, noteid and commenter's doc-id, and note owner's username to the server 
	
		document.querySelector('textarea[name="feedbackText"]').value = ''
	
		alert('Feedback sent')
	})
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
function smoothScrollTo(element, duration = 1000, offset = 100, callback = null) {
    const targetPosition = element.getBoundingClientRect().top - offset; // Adjust position with offset
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
            // If there is a callback (like highlight function), call it after scrolling
            if (callback) callback();
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

function highlightSection(element) {
    const highlightColor = '#F0F0F0'; // Light yellow or any desired highlight color
    const originalColor = getComputedStyle(element).backgroundColor; // Get the element's original background color

    element.style.transition = 'background-color 0.3s ease';

    // First blink (light yellow)
    element.style.backgroundColor = highlightColor;

    setTimeout(() => {
        // Second blink (back to original)
        element.style.backgroundColor = originalColor;

        setTimeout(() => {
            // Final highlight (light yellow)
            element.style.backgroundColor = highlightColor;

            setTimeout(() => {
                // Return to the original color
                element.style.backgroundColor = originalColor;
            }, 300); // Duration of the final highlight
        }, 300); // Duration of the second blink
    }, 300); // Duration of the first blink
}



// Main function to check for hash and apply smooth scroll + highlight
document.addEventListener("DOMContentLoaded", function () {
    const hash = window.location.hash;
    if (hash) {
        const section = document.querySelector(hash); // Select element with matching ID
        if (section) {
            smoothScrollTo(section, 1000, 100, () => highlightSection(section)); // Smooth scroll and then highlight
        }
    }
});

