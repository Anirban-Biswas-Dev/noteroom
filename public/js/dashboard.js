const host = window.location.origin
const socket = io(host)


socket.on('increment-upvote-dashboard', function (noteDocID) {
	let noteCard = document.querySelector(`#note-${noteDocID}`)
	noteCard !== null ? (function () {
		let uvCount = noteCard.querySelector(".uv-count")
		noteCard.querySelector(".uv-count").innerHTML = parseInt(uvCount.innerHTML) + 1
	})() : false
})
socket.on('decrement-upvote-dashboard', function (noteDocID) {
	let noteCard = document.querySelector(`#note-${noteDocID}`)
	noteCard !== null ? (function () {
		let uvCount = noteCard.querySelector(".uv-count")
		noteCard.querySelector(".uv-count").innerHTML = parseInt(uvCount.innerHTML) - 1
	})() : false
})



async function upvote(voteContainer) {
	const voterStudentID = Cookies.get("studentID")
	const noteDocID = voteContainer.getAttribute('data-noteid')
	const isUpvoted = voteContainer.getAttribute('data-isupvoted') === "true" ? true : false
	const noteCard = document.querySelector(`#note-${noteDocID}`)

	let voteData = new FormData()
	voteData.append('noteDocID', noteDocID)
	voteData.append('voterStudentID', voterStudentID)
	voteData.append('fromDashboard', "true")

	function replaceUpvoteArrow(svg, action) {
		noteCard.querySelector('#upvote-container .uv-icon').innerHTML = svg
		action === "delete" ? voteContainer.setAttribute('data-isupvoted', 'false') : voteContainer.setAttribute('data-isupvoted', 'true')
	}

	if (!isUpvoted) {
		let response = await fetch(`/view/${noteDocID}/vote?type=upvote`, {
			body: voteData,
			method: 'post'
		})
		let data = await response.json()
		data.ok ? replaceUpvoteArrow(`<path
			d="M20.293 10.2935L19.5859 11.0006L20.293 10.2935ZM10.2929 1.70717L9.58575 1.00008L10.2929 1.70717ZM9.58575 1.00008L0.999862 9.58646L2.41412 11.0006L11 2.41425L9.58575 1.00008ZM2.41412 13.0006H6V11.0006H2.41412V13.0006ZM6 13.0006V19.5H8V13.0006H6ZM9.5 23H12.5V21H9.5V23ZM16 19.5V13.0006H14V19.5H16ZM16 13.0006H19.5859V11.0006H16V13.0006ZM21.0001 9.58646L12.4143 1.00008L11 2.41425L19.5859 11.0006L21.0001 9.58646ZM19.5859 13.0006C21.3677 13.0006 22.26 10.8464 21.0001 9.58646L19.5859 11.0006L19.5859 11.0006V13.0006ZM16 13.0006L16 13.0006V11.0006C14.8954 11.0006 14 11.8961 14 13.0006H16ZM12.5 23C14.433 23 16 21.433 16 19.5H14C14 20.3284 13.3284 21 12.5 21V23ZM6 19.5C6 21.433 7.567 23 9.5 23V21C8.67157 21 8 20.3284 8 19.5H6ZM6 13.0006L6 13.0006H8C8 11.8961 7.10457 11.0006 6 11.0006V13.0006ZM0.999862 9.58646C-0.260013 10.8464 0.632334 13.0006 2.41412 13.0006V11.0006L2.41412 11.0006L0.999862 9.58646ZM11 2.41425L11 2.41425L12.4143 1.00008C11.6332 0.218978 10.3668 0.218978 9.58575 1.00008L11 2.41425ZM11 1L21 11H14V21H8V11H1L11 1Z"
			fill="#00FF00"
		/>`, "add") : false
	} else {
		let response = await fetch(`/view/${noteDocID}/vote?type=upvote&action=delete`, {
			body: voteData,
			method: 'post'
		})
		let data = await response.json()
		data.ok ? replaceUpvoteArrow(`<path
			d="M20.293 10.2935L19.5859 11.0006L20.293 10.2935ZM10.2929 1.70717L9.58575 1.00008L10.2929 1.70717ZM9.58575 1.00008L0.999862 9.58646L2.41412 11.0006L11 2.41425L9.58575 1.00008ZM2.41412 13.0006H6V11.0006H2.41412V13.0006ZM6 13.0006V19.5H8V13.0006H6ZM9.5 23H12.5V21H9.5V23ZM16 19.5V13.0006H14V19.5H16ZM16 13.0006H19.5859V11.0006H16V13.0006ZM21.0001 9.58646L12.4143 1.00008L11 2.41425L19.5859 11.0006L21.0001 9.58646ZM19.5859 13.0006C21.3677 13.0006 22.26 10.8464 21.0001 9.58646L19.5859 11.0006L19.5859 11.0006V13.0006ZM16 13.0006L16 13.0006V11.0006C14.8954 11.0006 14 11.8961 14 13.0006H16ZM12.5 23C14.433 23 16 21.433 16 19.5H14C14 20.3284 13.3284 21 12.5 21V23ZM6 19.5C6 21.433 7.567 23 9.5 23V21C8.67157 21 8 20.3284 8 19.5H6ZM6 13.0006L6 13.0006H8C8 11.8961 7.10457 11.0006 6 11.0006V13.0006ZM0.999862 9.58646C-0.260013 10.8464 0.632334 13.0006 2.41412 13.0006V11.0006L2.41412 11.0006L0.999862 9.58646ZM11 2.41425L11 2.41425L12.4143 1.00008C11.6332 0.218978 10.3668 0.218978 9.58575 1.00008L11 2.41425Z"
			fill="black"
		/>`, "delete") : false
	}
}






//* Function to get paginated notes
let page = 2
async function add_note(count) {
	/*
	# Process:
	~	a fetch request is sent with desired page number and number of notes (1). if there are any notes left, it is retuned as a list (2).
	~	the data is then prepared and pused in a list (3) which is then returned (4). lastly, the page number gets increased.
	*/
	let notesList = [];
	try {
		let response = await fetch(`/api/getnote?type=seg&page=${page}&count=${count}`); // 1
		let notes = await response.json(); // 2

		if (notes.length !== 0) {
			notes.forEach(note => {
				let noteData = {
					thumbnail: note.content[0],
					noteID: note._id,
					feedbackCount: note.feedbackCount,
					profile_pic: note.ownerDocID.profile_pic,
					noteTitle: note.title,
					ownerID: note.ownerDocID.studentID,
					ownerDisplayName: note.ownerDocID.displayname,
					upvoteCount: note.upvoteCount,
					ownerUserName: note.ownerDocID.username
				};
				notesList.push(noteData); // 3
			});
			page = page + 1; // Increment the page after processing the notes
		}
	} catch (error) {
		console.log(error.message);
	}
	return notesList; // 4
}



//* Observer's object
const observers = {
	observer: function () {
		/*
		# Process:
		~	the thumbnail lazy loading observer. when a note is added in the dashboard, the thumbnail's image element keeps its thumbnail
		~ 	source in data-src attribute. when the note is at least 300px ahead (2) from the current viewport, the image is then loaded (1)
		~	until then, the skeleton loader runs. 
		*/

		const _observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					let image = entry.target.querySelector('.thumbnail-container .thumbnail')
					let imageURL = image.getAttribute('data-src')

					image.onload = function () {
						image.parentElement.querySelector('.thumbnail-loading').style.display = 'none' // skeleton loader
						image.style.display = 'flex'
					}

					image.src = imageURL // 1
					image.removeAttribute('data-src')
					_observer.unobserve(entry.target)
				}
			})
		}, {
			rootMargin: "300px" // 2
		})
		return _observer
	},

	lastNoteObserver: function () {
		/*
		# Process:
		~ 	after the page is loaded, first 3 notes are added. their thumbnail loads lazily with lazy-load observer. when the last note is in 
		~	viewport with 100% of appearance, then the next image page in fetched. (1 page = 3 notes:list) (1). if that page actually contains 1 or
		~	more than 1 notes, then they are added in the dashboard (2). also, if they are also marked as saved, the save class is added in the save
		~	button (3). 
		~	then the last note observer unobserves the last note (4) and look forward to find the next page's last note if exists (5). it helps to 
		~	keep an	scrolling flow until all the notes are shown 
		*/

		const _observer = new IntersectionObserver(async entries => {
			let lastNote = entries[0]
			if (lastNote.isIntersecting) {
				document.querySelector('.fetch-loading').style.display = 'flex'
				let noteList = await add_note(3) // 1
				if (noteList.length != 0) {
					noteList.forEach(async note => {
						if (!document.querySelector(`#note-${note.noteID}`)) {
							manageNotes.addNote(note) // 2
							let savedNotesObj = await manageDb.get('savedNotes')
							let savedNotes = savedNotesObj.map(obj => obj.noteID)

							if (savedNotes.includes(note.noteID)) {
								document.querySelector(`#save-btn-${note.noteID}`).classList.add('saved') // 3
								document.querySelector(`#save-btn-${note.noteID} .save-note-btn .fa-solid`).style.display = 'inline'
								document.querySelector(`#save-btn-${note.noteID} .save-note-btn .fa-regular`).style.display = 'none'
							}
						}
					})
					_observer.unobserve(lastNote.target) // 4
					_observer.observe(document.querySelector('.feed-note-card:last-child')) // 5
				} else {
					document.querySelector('.finish').style.display = 'flex'
					document.querySelector('.fetch-loading').style.display = 'none'
				}
			}
		}, {
			threshold: 1
		})
		return _observer
	}
}

/**
 * @description When back_forward is captured, these functions will add cards if there are any in IndexedBD 
*/
let back_forward_note_add = {
	async addSavedNotes() {
		let savedNotes = await manageDb.get('savedNotes');

		if (savedNotes.length != 0) {
			document.querySelector('.no-saved-notes-message').style.display = 'none'
			savedNotes.forEach(note => {
				manageNotes.addSaveNote(note)
				let _note = document.querySelector(`#save-btn-${note.noteID}`)
				if (_note) {
					_note.classList.add("saved")
					document.querySelector(`#save-btn-${note.noteID} .save-note-btn .fa-solid`).style.display = 'inline'
					document.querySelector(`#save-btn-${note.noteID} .save-note-btn .fa-regular`).style.display = 'none'
				}
			})
		}
	},

	async addNotis() {
		let notis = await manageDb.get('notis')

		if (notis.length != 0) {
			notis.forEach(noti => {
				manageNotes.addNoti(noti)
			})
		}
	},

	async addUNotes() {
		let notes = await manageDb.get('notes')

		if (notes.length != 0) {
			notes.forEach(note => {
				manageNotes.addNote(note)
			})
		}
	}
}

let [navigate] = performance.getEntriesByType('navigation')
if ((navigate.type === 'navigate') || (navigate.type == 'reload')) {

	db.notis.clear()
	db.notes.clear()

	let studentDocID = Cookies.get('recordID').split(':')[1].replaceAll('"', '')
	let studentID = Cookies.get('studentID')

	fetch(`/api/getNote?type=save&studentDocID=${studentDocID}`) // 1.1
		.then(response => response.json())
		.then(notes => {
			notes.forEach(note => {
				let noteData = {
					noteID: note._id,
					noteTitle: note.title,
				}
				manageDb.add('savedNotes', noteData)
			})
		})
		.catch(error => console.log(error.message))

	fetch(`/api/getNotifs?studentID=${studentID}`)
		.then(response => response.json())
		.then(notifs => {
			notifs.forEach(noti => {
				let isVote = noti.docType === "note-vote" ? true : false
				let _notiData = {
					notiID: noti._id,
					isread: noti.isRead,
					noteID: noti.noteDocID._id,
					nfnTitle: noti.noteDocID.title
				}
				let notiData = !isVote ? {
					..._notiData,
					feedbackID: noti.feedbackDocID,
					commenterUserName: noti.commenterDocID.username,
					commenterDisplayName: noti.commenterDocID.displayname
				} : _notiData
				manageDb.add('notis', notiData)
			})
		})

} else if (navigate.type === 'back_forward') {
	back_forward_note_add.addSavedNotes()
	back_forward_note_add.addNotis()
	back_forward_note_add.addUNotes()
}


// A checker if there are any saved notes in `savedNotes` store, if not, shows the no-saved-notes message
async function checkNoSavedMessage() {
	let _savedNotes = await manageDb.get('savedNotes')
	let noSavedNoteMessage = document.querySelector('.no-saved-notes-message')

	if (_savedNotes.length === 0) {
		if (noSavedNoteMessage) {
			noSavedNoteMessage.style.display = 'inline'
		}
	}
}

//* save/delete a note
async function saveNote(noteDocID, noteTitle) {
	let recordID = Cookies.get('recordID').split(':')[1].replaceAll('"', '');
	let saveBtnDiv = document.querySelector(`#save-btn-${noteDocID}`)

	if (saveBtnDiv.classList.contains("saved")) {
		//* Delete note: from db, removing note-card, from `savedNotes` store
		socket.emit('delete-saved-note', recordID, noteDocID);

		document.querySelector(`#saved-note-${noteDocID}`).remove()
		await manageDb.delete('savedNotes', noteDocID)
		await checkNoSavedMessage()
	} else {
		//* Save note: into db, removing no-saved-notes message, into frontend, into `savedNotes` store
		socket.emit('save-note', recordID, noteDocID);
		document.querySelector('.no-saved-notes-message').style.display = 'none'

		let savedNoteObject = { noteID: noteDocID, noteTitle: noteTitle }
		manageNotes.addSaveNote(savedNoteObject)
		manageDb.add('savedNotes', savedNoteObject)
		document.querySelector('.no-saved-notes-message')?.remove()
	}
}


//* Triggering all the observers
try {
	document.querySelectorAll('.feed-note-card').forEach(card => {
		observers.observer().observe(card)
	})
	observers.lastNoteObserver().observe(document.querySelector('.feed-note-card:last-child'))
} catch (error) {
	console.error(error)
}


//* Note upload WS event
socket.on('note-upload', (noteData) => {
	/*
	# Process: when a note is uploaded, this event is handled by every online user
	~	first the data is added as isAddNote in LS|key=addedNotes. then it is added in the dashboard.
	*/
	manageNotes.addNote(noteData)
	manageDb.add('notes', noteData)
})



function initializeSaveButtons() {
	const buttons = document.querySelectorAll('.svn-btn-parent:not([data-initialized])');

	buttons.forEach((button) => {
		const isSaved = button.classList.contains('saved');
		const iconRegular = button.querySelector('.fa-regular');
		const iconSolid = button.querySelector('.fa-solid');

		// Set initial state
		iconRegular.style.display = isSaved ? 'none' : 'inline';
		iconSolid.style.display = isSaved ? 'inline' : 'none';

		// Add click event listener
		button.addEventListener('click', () => {
			if (iconRegular.style.display === 'none') {
				iconRegular.style.display = 'inline';
				iconSolid.style.display = 'none';
				button.classList.remove('saved');
			} else {
				iconRegular.style.display = 'none';
				iconSolid.style.display = 'inline';
				button.classList.add('saved');

				// Add animation effect
				button.classList.add('active');
				setTimeout(() => button.classList.remove('active'), 600);
			}
		});

		// Mark button as initialized
		button.setAttribute('data-initialized', 'true');
	});
}

// Initialize Save Buttons on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
	initializeSaveButtons();
});

// Re-initialize Save Buttons when new content is lazy-loaded
const saveButtonObserver = new MutationObserver(() => {
	initializeSaveButtons();
});

// Observe the parent container of lazy-loaded cards
const saveButtonContainer = document.querySelector('.feed-container'); // Replace with the appropriate selector
if (saveButtonContainer) {
	saveButtonObserver.observe(saveButtonContainer, { childList: true, subtree: true });
}

// function createConfetti(button) {
//   const confettiContainer = document.createElement('div');
//   confettiContainer.className = 'confetti';
//   button.appendChild(confettiContainer);

//   for (let i = 0; i < 50; i++) {
//     const confettiPiece = document.createElement('div');
//     confettiPiece.className = 'confetti-piece';
//     confettiPiece.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
//     confettiPiece.style.top = `${Math.random() * 100}%`;
//     confettiPiece.style.left = `${Math.random() * 100}%`;

//     const size = Math.random() * 8 + 4;
//     confettiPiece.style.width = `${size}px`;
//     confettiPiece.style.height = `${size}px`;
//     confettiPiece.style.opacity = 1;

//     confettiContainer.appendChild(confettiPiece);

//     confettiPiece.animate([
//       { transform: `translateY(0) rotate(${Math.random() * 360}deg)` },
//       { transform: `translateY(${Math.random() * -300}px) rotate(${Math.random() * 360}deg)` }
//     ], {
//       duration: 1500 + Math.random() * 1000,
//       easing: 'ease-out',
//       fill: 'forwards'
//     });
//   }

//   setTimeout(() => confettiContainer.remove(), 2000);
// }

// // Confetti for new user celebration
// const canvas = document.getElementById('confettiCanvas');
// const ctx = canvas.getContext('2d');
// let confetti = [];
// let animationFrame;
// let confettiBlown = false;
// let hasStopped = false;  // New flag to track when confetti has stopped

// // Set canvas size to match window
// function resizeCanvas() {
// 	canvas.width = window.innerWidth;
// 	canvas.height = window.innerHeight;
// }
// resizeCanvas();
// window.addEventListener('resize', resizeCanvas);

// function createConfettiPiece() {
// 	return {
// 		x: Math.random() * canvas.width,
// 		y: Math.random() * canvas.height - canvas.height,
// 		width: Math.random() * 10 + 5,  // Rectangular width
// 		height: Math.random() * 6 + 3,  // Rectangular height
// 		color: gsap.utils.random(["#FF6F61", "#FFD700", "#4CAF50", "#42A5F5", "#FF4081", "#FFEB3B", "#7E57C2", "#F06292", "#FFA726", "#8BC34A"]),
// 		rotation: Math.random() * Math.PI * 2,
// 		speed: Math.random() * 3 + 2,
// 		rotationSpeed: Math.random() * 0.02 + 0.01,
// 		drift: Math.random() * 0.5 - 0.25,  // Adds slight drifting to left/right
// 		fallSpeed: Math.random() * 2 + 3
// 	};
// }

// function updateConfetti() {
// 	ctx.clearRect(0, 0, canvas.width, canvas.height);

// 	let activeConfettiCount = 0;

// 	confetti.forEach((piece, index) => {
// 		piece.y += piece.fallSpeed;
// 		piece.x += piece.drift;
// 		piece.rotation += piece.rotationSpeed;

// 		if (piece.y < canvas.height) {
// 			activeConfettiCount++;
// 		}

// 		ctx.save();
// 		ctx.translate(piece.x, piece.y);
// 		ctx.rotate(piece.rotation);
// 		ctx.fillStyle = piece.color;
// 		ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
// 		ctx.restore();
// 	});

// 	// Continue animating if there's active confetti
// 	if (activeConfettiCount > 0 || !hasStopped) {
// 		animationFrame = requestAnimationFrame(updateConfetti);
// 	} else {
// 		// Once all confetti is down, stop the animation
// 		stopConfetti();
// 	}
// }

// function startConfetti() {
// 	// Create all confetti pieces in one burst
// 	confetti = Array.from({ length: 200 }, createConfettiPiece);
// 	confettiBlown = true;
// 	hasStopped = false;  // Reset stop flag
// 	updateConfetti();
// }

// function stopConfetti() {
// 	// When all pieces are off screen, stop the animation naturally
// 	cancelAnimationFrame(animationFrame);
// 	hasStopped = true;  // Set flag to stop future updates
// 	confetti = [];
// 	ctx.clearRect(0, 0, canvas.width, canvas.height);
// }

// if(URL.parse(document.referrer).pathname === '/sign-up') {
// 	startConfetti()
// }

class NoteMenu {
	constructor(menuButton) {
		this.menuButton = menuButton; // The button that triggers the menu
		this.menu = menuButton.nextElementSibling; // The corresponding menu
		this.init();
	}

	init() {
		this.menuButton.addEventListener('click', (event) => {
			event.stopPropagation(); // Prevent the click from propagating to the window
			this.toggleMenu();
			this.closeOtherMenus();
		});
	}

	toggleMenu() {
		// Toggle the active class to show/hide the menu
		this.menu.classList.toggle('active');
	}

	closeOtherMenus() {
		// Close all other menus when clicking on one
		const allMenus = document.querySelectorAll('.menu-options');
		allMenus.forEach((menu) => {
			if (menu !== this.menu && menu.classList.contains('active')) {
				menu.classList.remove('active');
			}
		});

		// Remove this event listener after it's triggered
		window.addEventListener('click', (event) => this.closeAllMenus(event));
	}

	closeAllMenus(event) {
		// Close the menu if clicked anywhere outside
		const menus = document.querySelectorAll('.menu-options');
		menus.forEach((menu) => {
			if (menu.classList.contains('active') && !menu.contains(event.target)) {
				menu.classList.remove('active');
			}
		});

		// Remove the event listener for closing menus after one action
		window.removeEventListener('click', this.closeAllMenus);
	}
}

// Function to initialize NoteMenu for all buttons
function initializeNoteMenus() {
	const noteMenuButtons = document.querySelectorAll('.note-menu-btn:not([data-initialized])');
	noteMenuButtons.forEach((btn) => {
		new NoteMenu(btn); // Create a new instance of NoteMenu for each button
		btn.setAttribute('data-initialized', 'true'); // Mark as initialized
	});
}

// Initialize NoteMenus on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
	initializeNoteMenus();
});

// Re-initialize NoteMenus when new content is lazy-loaded
const observer = new MutationObserver(() => {
	initializeNoteMenus();
});

// Observe the parent container of lazy-loaded cards
const feedContainer = document.querySelector('.feed-container'); // Replace with the appropriate selector
if (feedContainer) {
	observer.observe(feedContainer, { childList: true, subtree: true });
}


let alert = document.querySelector('#production')
if (alert) {
	if (location.href.includes("noteroom.co")) {
		document.querySelector('#production').remove()
	}
}

try {
	//* Temporary alert close
	document.querySelector('.error__close').addEventListener('click', function () {
		document.querySelector('.error').remove()
	})
} catch (error) { }
