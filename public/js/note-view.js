const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('join-room', window.location.pathname.split('/')[2] /* The note-id as the unique room name */)

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
								<img src="/${feedbackData.commenterDocID.profile_pic}" alt="User Avatar" class="feedback-avatar">
								<div class="feedback-author-info">
									<a href='/user/${feedbackData.commenterDocID.studentID}'><h4 class="feedback-author">${feedbackData.commenterDocID.displayname}</h4></a>
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
	//* sending room-name (unique noteDocID), feedback-text, noteid and commenter's doc-id, and note owner's username to the server 

	document.querySelector('textarea[name="feedbackText"]').value = ''

	alert('Feedback sent')
})
