const host = 'http://localhost:2000'
const socket = io(host)

function truncatedTitle(title) {
  const titleCharLimit = 30;
  let truncatedTitle =
    title.length > titleCharLimit
      ? title.slice(0, titleCharLimit) + "..."
      : title;
  return truncatedTitle
}


function addNote(noteData) {
  /*
  noteData:
    thumbnail: The first image of the image-stack, will be used for preview at dashboard
    noteID: Unique id for each note to redirect users to the specific note (view/<note-id>)
    profile_pic: The profile picture of the owner of the note
    noteTitle: Title of the note
    ownerID: Note owner's student ID, will be used to redirect users to the note-owner (user/<owner-ID>)
    ownerDisplayname: Note owner's displayname
  */

  let noteCardsHtml = `
  				<div class="feed-note-card" id="note-${noteData.noteID}">
					<div class="thumbnail-container">
						<img class="thumbnail" src="${noteData.thumbnail}"> 
						<button class="save-note-btn" id="save-btn-${noteData.noteID}" onclick="saveNote('${noteData.noteID}')">
							<i class="fa-regular fa-bookmark"></i>
							<i class="fa-solid fa-bookmark saved"></i>
						</button>
					</div>
				<div class="note-details">
					<div class="author-info">
						<img src="${noteData.profile_pic}" class="author-img">
						<div class="author-title-container">
							<div class="note-title"><a href="/view/${noteData.noteID}" onclick='location.reload()'>${noteData.noteTitle}</a></div>
							<div class="author"><a class="author-prfl-link" href="/user/${noteData.ownerID}">${noteData.ownerDisplayName}</a></div>
						</div>
					</div>
					<div class="note-engagement">
						<svg class="download-icon" width="40" height="40" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M37.1541 26.5395V33.6165C37.1541 34.555 36.7813 35.455 36.1177 36.1186C35.4541 36.7822 34.5541 37.155 33.6156 37.155H8.84623C7.90776 37.155 7.00773 36.7822 6.34414 36.1186C5.68054 35.455 5.30774 34.555 5.30774 33.6165V26.5395M12.3847 17.6933L21.2309 26.5395M21.2309 26.5395L30.0771 17.6933M21.2309 26.5395V5.30859" stroke="#1E1E1E" stroke-width="2.29523" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<svg class="comment-icon" width="40" height="40" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M34.4051 23.9151C34.4051 24.8838 34.0257 25.8128 33.3505 26.4978C32.6753 27.1828 31.7595 27.5676 30.8045 27.5676H9.20113L2 34.8726V5.65252C2 4.68381 2.37934 3.75478 3.05458 3.0698C3.72982 2.38482 4.64564 2 5.60057 2H30.8045C31.7595 2 32.6753 2.38482 33.3505 3.0698C34.0257 3.75478 34.4051 4.68381 34.4051 5.65252V23.9151Z" stroke="#1E1E1E" stroke-width="2.40038" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<svg class="share-icon" width="40" height="40" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M30.6079 32.5223L27.8819 29.8441L36.6816 21.0444L27.8819 12.2446L30.6079 9.56641L42.0858 21.0444L30.6079 32.5223ZM3.82599 36.3483V28.6963C3.82599 26.05 4.7506 23.8023 6.59983 21.953C8.48094 20.0719 10.7446 19.1314 13.391 19.1314H25.2037L18.3169 12.2446L21.0429 9.56641L32.5209 21.0444L21.0429 32.5223L18.3169 29.8441L25.2037 22.9574H13.391C11.7968 22.9574 10.4418 23.5153 9.32584 24.6312C8.20993 25.7471 7.65197 27.1022 7.65197 28.6963V36.3483H3.82599Z" fill="#1D1B20"/>
						</svg>
					</div>            
				</div>
			</div> 
	`; 
  document.querySelector('.feed-container').insertAdjacentHTML('beforeend', noteCardsHtml);
}

function addNoti(feedbackData) {
  /*
  feedbackData:
    ownerUsername: The username of the owner of the note of which the feedback is given
    notiID: Unique ID of the feedback notification
    noteDocID: Unique ID of the note, will be used to redirect the owner to note on which the feedback is given (view/<note-id>)
    nfnTitle: This is actually the title of the note, will be used for notification title
    commenterStudentID: The student ID of the student who gave the feedback, will be used for redirecting the owner to the commenter's profile (user/<commenter-student-id>)
    commenterDisplayname: The displayname of the commenter
  */
  let notificationHtml = `
        <div class="notification" id="${feedbackData.notiID}">
            <div class="first-row">
              <a href='/view/${feedbackData.noteDocID}' class="notification-link">
                <span class="notification-title">
                ${truncatedTitle(feedbackData.nfnTitle)}
                </span>
              </a>  
              <span class="remove-notification" onclick="deleteNoti('${feedbackData.notiID}')">&times;</span>
            </div>
            <div class="notification-msg">
              <a href='/user/${feedbackData.commenterStudentID}' class="commenter-prfl">
              ${feedbackData.commenterDisplayName}
              </a><a href='/view/${feedbackData.noteDocID}' class="notification-link-2"> has given feedback on your notes! Check it out.</a>
            </div>
        </div>`
  document.querySelector('.notifications-container').insertAdjacentHTML('afterbegin', notificationHtml);
}

function addSaveNote(noteData) {
  /*
  noteData:
    noteTitle: The title of the note
    noteDocID: The doc-id of the note to redirect user to the specific note (/view/note-doc-id)
  */
  let savedNotesHtml = `
	  <div class="saved-note" id="saved-note-${noteData.noteID}">
		  <span class="sv-note-title">
			  <a href='/view/${noteData.noteID}'>${truncatedTitle(noteData.noteTitle)}</a>
		  </span>
	  </div>`;
  document.querySelector(".saved-notes-container").insertAdjacentHTML('afterbegin', savedNotesHtml)
}

function updateLocalStorage(key, noteID_noteObj, method) {
	if(method == 'insert') {
		let values = JSON.parse(localStorage.getItem(key))
		if (values !== null) {
			values.push(noteID_noteObj)
		} else {
			localStorage.setItem(key, JSON.stringify([]))
			let values = JSON.parse(localStorage.getItem(key))
			values.push(noteID_noteObj)
		}
		localStorage.setItem(key, JSON.stringify(values))
		console.log(JSON.parse(localStorage.getItem(key)))
	} else if(method == 'remove') {
		let values = JSON.parse(localStorage.getItem(key))
		let noteData = values.find(item => item.noteID == noteID_noteObj)
		let modifiedDocs = values.filter(item => item.noteID !== noteData.noteID)
		localStorage.setItem(key, JSON.stringify(modifiedDocs))
	}
}

function isExists(key, noteDocID) {
	let values = JSON.parse(localStorage.getItem(key))
	let noteData = values.find(item => item.noteID == noteDocID)
	return !(noteData == undefined)
}

socket.on('note-upload' /* Event handler of the event triggered after uploading a note */, (noteData) => {
	noteData.isAddNote = true //* Idenfing a note object that needs to be added after back_forward
	updateLocalStorage('addedNotes', noteData, 'insert')
	addNote(noteData)
})


socket.on('feedback-given' , (feedbackData) => {
	if (feedbackData.ownerUsername == Cookies.get('recordName')) {
		feedbackData.isNoti = true //* Identifing a notification object
		updateLocalStorage('notis', feedbackData, 'insert') // Adding notification data in the localStorage (BUG-1)
		addNoti(feedbackData)

		const nftShake = document.querySelector('.mobile-nft-btn')
		nftShake.classList.add('shake')
		setTimeout(() => {
			nftShake.classList.remove('shake');
		}, 300)
		console.log(nftShake);
	}
})

let saved_notes = []
let [navigate] = performance.getEntriesByType('navigation')
if ((navigate.type === 'navigate') || (navigate.type == 'reload')) {

	localStorage.clear()
	document.querySelector('.saved-notes-container').querySelectorAll('span.saved-note-doc-id').forEach(noteDocID => {
		let noteData = {
			noteID: noteDocID.innerHTML,
			noteTitle: document.querySelector(`#note-${noteDocID.innerHTML} .note-title a`).innerHTML,
			isSavedNote: true 
		}
		saved_notes.push(noteData)
	})
	localStorage.setItem('savedNotes', JSON.stringify(saved_notes))
	localStorage.setItem('notis', JSON.stringify([]))

} else if (navigate.type === 'back_forward') {
	let Datas = Object.values(localStorage)
	Datas.forEach(CardStr => {
		let data = JSON.parse(CardStr)
		data.map(note => {
			if(note.isAddNote) {
				let existingNote = document.querySelector(`#note-${note.noteID}`)
				if(existingNote === null) {
					addNote(note)
				}
			} 
			else if(note.isSavedNote) {
				if(isExists('savedNotes', note.noteID)) {
					let existingNote = document.querySelector(`#saved-note-${note.noteID}`)
					if(existingNote === null) {
						addSaveNote(note)
						document.querySelector(`#save-btn-${note.noteID}`).classList.add('saved')
					}
				}	
			} 
			else if(note.isNoti) {
				addNoti(note)
			} 
		})
	})
}


function saveNote(noteDocID) {
    let button = document.querySelector(`#save-btn-${noteDocID}`);
    let recordID = Cookies.get('recordID').split(':')[1].replaceAll('"', '');

    if (!button.classList.contains('saved')) {
        button.classList.add('saved');
        let noteData = {
            noteID: noteDocID,
            noteTitle: document.querySelector(`#note-${noteDocID} .note-title a`).innerHTML,
            isSavedNote: true 
        };
        updateLocalStorage('savedNotes', noteData, 'insert');
        addSaveNote(noteData);
        socket.emit('save-note', recordID, noteDocID);

    } else {
        socket.emit('delete-saved-note', recordID, noteDocID);
        button.classList.remove('saved');
        updateLocalStorage('savedNotes', noteDocID, 'remove');
        document.querySelector(`#saved-note-${noteDocID}`).remove(); 
    }
}


function deleteNoti(id) {
	socket.emit('delete-noti', id) 
	document.getElementById(id).remove() 
	updateLocalStorage('notis', id, 'remove')
}

const notificationPanel = document.querySelector('.notification-panel');
const notificationButton = document.querySelector('.mobile-nft-btn');
const backgroundOverlay = document.querySelector('.background-overlay');
const hideNotificationPanel = document.querySelector('.btn-hide-nft');

notificationButton.addEventListener('click', () => {
  notificationPanel.classList.toggle('show');
  backgroundOverlay.classList.toggle('show-overlay');
});
backgroundOverlay.addEventListener('click', () => {
  notificationPanel.classList.remove('show');
  backgroundOverlay.classList.remove('show-overlay');
});
hideNotificationPanel.addEventListener('click', () => {
  notificationPanel.classList.remove('show');
  backgroundOverlay.classList.remove('show-overlay');
})
// Saved notes functionality for adding visual effect when saved. 

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.save-note-btn');

  buttons.forEach(button => {
    const isSaved = button.classList.contains('saved');
    const iconRegular = button.querySelector('.fa-regular');
    const iconSolid = button.querySelector('.fa-solid');

    iconRegular.style.display = isSaved ? 'none' : 'inline';
    iconSolid.style.display = isSaved ? 'inline' : 'none';

    button.addEventListener('click', () => {
      if (iconRegular.style.display === 'none') {
        iconRegular.style.display = 'inline';
        iconSolid.style.display = 'none';
        button.classList.remove('saved');
      } else {
        iconRegular.style.display = 'none';
        iconSolid.style.display = 'inline';
        button.classList.add('saved');

        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 600);

        createConfetti(button);
      }
    });
  });
});

function createConfetti(button) {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti';
  button.appendChild(confettiContainer);

  for (let i = 0; i < 50; i++) {
    const confettiPiece = document.createElement('div');
    confettiPiece.className = 'confetti-piece';
    confettiPiece.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
    confettiPiece.style.top = `${Math.random() * 100}%`;
    confettiPiece.style.left = `${Math.random() * 100}%`;

    const size = Math.random() * 8 + 4;
    confettiPiece.style.width = `${size}px`;
    confettiPiece.style.height = `${size}px`;
    confettiPiece.style.opacity = 1;

    confettiContainer.appendChild(confettiPiece);

    confettiPiece.animate([
      { transform: `translateY(0) rotate(${Math.random() * 360}deg)` },
      { transform: `translateY(${Math.random() * -300}px) rotate(${Math.random() * 360}deg)` }
    ], {
      duration: 1500 + Math.random() * 1000,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }

  setTimeout(() => confettiContainer.remove(), 2000);
}

// Confetti for new user celebration
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let confetti = [];
let animationFrame;
let confettiBlown = false;
let hasStopped = false;  // New flag to track when confetti has stopped

// Set canvas size to match window
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createConfettiPiece() {
	return {
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height - canvas.height,
		width: Math.random() * 10 + 5,  // Rectangular width
		height: Math.random() * 6 + 3,  // Rectangular height
		color: gsap.utils.random(["#FF6F61", "#FFD700", "#4CAF50", "#42A5F5", "#FF4081", "#FFEB3B", "#7E57C2", "#F06292", "#FFA726", "#8BC34A"]),
		rotation: Math.random() * Math.PI * 2,
		speed: Math.random() * 3 + 2,
		rotationSpeed: Math.random() * 0.02 + 0.01,
		drift: Math.random() * 0.5 - 0.25,  // Adds slight drifting to left/right
		fallSpeed: Math.random() * 2 + 3
	};
}

function updateConfetti() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	let activeConfettiCount = 0;

	confetti.forEach((piece, index) => {
		piece.y += piece.fallSpeed;
		piece.x += piece.drift;
		piece.rotation += piece.rotationSpeed;

		if (piece.y < canvas.height) {
			activeConfettiCount++;
		}

		ctx.save();
		ctx.translate(piece.x, piece.y);
		ctx.rotate(piece.rotation);
		ctx.fillStyle = piece.color;
		ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
		ctx.restore();
	});

	// Continue animating if there's active confetti
	if (activeConfettiCount > 0 || !hasStopped) {
		animationFrame = requestAnimationFrame(updateConfetti);
	} else {
		// Once all confetti is down, stop the animation
		stopConfetti();
	}
}

function startConfetti() {
	// Create all confetti pieces in one burst
	confetti = Array.from({ length: 200 }, createConfettiPiece);
	confettiBlown = true;
	hasStopped = false;  // Reset stop flag
	updateConfetti();
}

function stopConfetti() {
	// When all pieces are off screen, stop the animation naturally
	cancelAnimationFrame(animationFrame);
	hasStopped = true;  // Set flag to stop future updates
	confetti = [];
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function triggerConfetti() {
	let overlay = document.getElementById('overlay');

	// Show overlay
	overlay.classList.add('show');

	// Start confetti
	startConfetti();

	// Hide overlay after confetti has finished falling
	setTimeout(() => {
		overlay.classList.remove('show');
	}, 3000);  // You can adjust the overlay timing to match the animation length
}
