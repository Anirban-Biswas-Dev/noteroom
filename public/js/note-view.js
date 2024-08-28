const host = 'http://localhost:2000'
const socket = io(host)

socket.on('add-feedback', (feedbackData) => {
	//* Broadcasted feedback handler. The extented-feedback is broadcasted

	let date = new Date(feedbackData.createdAt)
	const formattedDate = date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
	}) // Human readable date format
	let feedbackCard = `<div class="feedback">
							<div class="feedback-header">
								<img src="/${feedbackData.studentid.profile_pic}" alt="User Avatar" class="feedback-avatar">
								<div class="feedback-author-info">
									<a href='/user/${feedbackData.studentid.studentid}'><h4 class="feedback-author">${feedbackData.studentid.displayname}</h4></a>
									<span class="feedback-date">${formattedDate}</span>
								</div>
							</div>
							<div class="feedback-body">
									<p>${feedbackData.feedbackContents}</p>
							</div>
							<div class="feedback-actions">
								<!-- <button type="button" class="btn-reply">Reply</button> -->
								<!-- <button type="button" class="btn-like">Like</button> -->
							</div>
						</div>` //* This feedback-card is used to broadcast the extented-feedback to all the users via websockets

		document.querySelector('.feedbacks-list').insertAdjacentHTML('afterbegin', feedbackCard) // The feedback will be shown at the top while posting (not fetching)
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

document.querySelector('.post-feedback').addEventListener('click', async function () {
	let feedback = document.querySelector('textarea[name="feedbackText"]').value

	socket.emit('feedback', feedback, window.location.pathname.split('/')[2], decodeURIComponent(document.cookie).split(':')[1].replaceAll('"', '')) 
		//* sending feedback-text, noteid and studentid (doc-id) to server so that the server

	document.querySelector('textarea[name="feedbackText"]').value = ''

	alert('Feedback sent')
})
