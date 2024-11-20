const host = window.location.origin
const socket = io(host)

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
        let response = await fetch(`/getnote?type=seg&page=${page}&count=${count}`); // 1
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
                    ownerDisplayName: note.ownerDocID.displayname
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
let savedNotes = []
const observers = {
	observer: function() {
		/*
		# Process:
		~	the thumbnail lazy loading observer. when a note is added in the dashboard, the thumbnail's image element keeps its thumbnail
		~ 	source in data-src attribute. when the note is at least 300px ahead (2) from the current viewport, the image is then loaded (1)
		~	until then, the skeleton loader runs. 
		*/

		const _observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if(entry.isIntersecting) {
					let image = entry.target.querySelector('.thumbnail-container .thumbnail')
					let imageURL = image.getAttribute('data-src')
		
					image.onload = function() {
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

	lastNoteObserver: function() {
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
			if(lastNote.isIntersecting) {
				document.querySelector('.fetch-loading').style.display = 'flex'
				let noteList = await add_note(3) // 1
				if(noteList.length != 0) {
					noteList.forEach(note => {
						if(!document.querySelector(`#note-${note.noteID}`)) {
							manageNotes.addNote(note) // 2
							if(savedNotes.includes(note.noteID)) {
								document.querySelector(`#save-btn-${note.noteID}`).classList.add('saved') // 3
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
		let savedNotes = await manageSavedNotes.get()
	
		if(savedNotes.length != 0) {
			document.querySelector('.no-saved-notes-message').style.display = 'none'
			savedNotes.forEach(note => {
				manageNotes.addSaveNote(note)
			})
		}
	},

	async addNotis() {
		let notis = await manageNotis.get()

		if (notis.length != 0) {
			notis.forEach(noti => {
				manageNotes.addNoti(noti)
			})
		}
	}
}

let [navigate] = performance.getEntriesByType('navigation')
if ((navigate.type === 'navigate') || (navigate.type == 'reload')) {
		
	let studentDocID = Cookies.get('recordID').split(':')[1].replaceAll('"', '')

	fetch(`/getNote?type=save&studentDocID=${studentDocID}`) // 1.1
		.then(response => response.json() )
		.then(notes => {
			notes.forEach(note => {
				let noteData = {
					noteID: note._id,
					noteTitle: note.title,
				}	
				manageSavedNotes.add(noteData)
				savedNotes.push(noteData.noteID)
			})
		})
		.catch(error => console.log(error.message))

} else if (navigate.type === 'back_forward') {	
	back_forward_note_add.addSavedNotes()
	back_forward_note_add.addNotis()
}


// A checker if there are any saved notes in `savedNotes` store, if not, shows the no-saved-notes message
async function checkNoSavedMessage() {
	let _savedNotes = await manageSavedNotes.get()
	let noSavedNoteMessage = document.querySelector('.no-saved-notes-message')

	if (_savedNotes.length == 0) {
		if(noSavedNoteMessage) {
			noSavedNoteMessage.style.display = 'inline' 
		}
	}
}

//* save/delete a note
async function saveNote(noteDocID, noteTitle) {
    let recordID = Cookies.get('recordID').split(':')[1].replaceAll('"', '');
    let saveBtnDiv = document.querySelector(`#save-btn-${noteDocID}`)

	if(saveBtnDiv.classList.contains("saved")) {
		//* Delete note: from db, removing note-card, from `savedNotes` store
		socket.emit('delete-saved-note', recordID, noteDocID);

		document.querySelector(`#saved-note-${noteDocID}`).remove()
		await manageSavedNotes.delete(noteDocID)
		await checkNoSavedMessage()
	} else {
		//* Save note: into db, removing no-saved-notes message, into frontend, into `savedNotes` store
		socket.emit('save-note', recordID, noteDocID);
		document.querySelector('.no-saved-notes-message').style.display = 'none'
		
		let savedNoteObject = { noteID: noteDocID, noteTitle: noteTitle }
		manageNotes.addSaveNote(savedNoteObject)
		manageSavedNotes.add(savedNoteObject)
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
	noteData.isAddNote = true 
	manageNotes.addNote(noteData)
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

if(URL.parse(document.referrer).pathname === '/sign-up') {
	startConfetti()
}

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
  
  

//* Temporary alert close
document.querySelector('.error__close').addEventListener('click', function() {
	document.querySelector('.error').remove()
})