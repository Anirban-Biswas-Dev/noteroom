const host = window.location.origin
const socket = io(host)

socket.on('update-upvote-dashboard', function (noteDocID, upvoteCount) {
	let noteCard = document.querySelector(`#note-${noteDocID}`)
	if (noteCard) {
		noteCard.querySelector(".uv-count").innerHTML = parseInt(upvoteCount)
	}
})

/*
FIXME: The "Saved Notes" are fetched and stored in IndexedDB when the user visits the `/dashboard` page.
!  However, if a user is redirected directly to the `/user-profile` page without first visiting `/dashboard`,
!  the notes in IndexedDB may be outdated or unavailable. This results in the user seeing stale data
!  in the "Saved Notes" tab.
*/
window.addEventListener('load', () => {
	async function getSavedNotes() {
		let response = await fetch('/api/note?noteType=saved')
		let savedNotes = await response.json()
		savedNotes.forEach(note => {
			manageDb.add('savedNotes', note)
		})
	}
	
	getSavedNotes()
})


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
					ownerUserName: note.ownerDocID.username,
					isSaved: note.isSaved,
					isUpvoted: note.isUpvoted
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
							manageNotes.addNote(note)
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

// /**
//  * @description When back_forward is captured, these functions will add cards if there are any in IndexedBD 
// */
// let back_forward_note_add = {
// 	async addSavedNotes() {
// 		let savedNotes = await manageDb.get('savedNotes');

// 		if (savedNotes.length != 0) {
// 			document.querySelector('.no-saved-notes-message').style.display = 'none'
// 			savedNotes.forEach(note => {
// 				manageNotes.addSaveNote(note)
// 				let _note = document.querySelector(`#note-${note.noteID} #save-note-btn`)
// 				if (_note) {
// 					_note.classList.add("saved")
// 				}
// 			})
// 		}
// 	},

// 	async addNotis() {
// 		let notis = await manageDb.get('notis')

// 		if (notis.length != 0) {
// 			notis.forEach(noti => {
// 				manageNotes.addNoti(noti)
// 			})
// 		}
// 	},

// 	async addUNotes() {
// 		let notes = await manageDb.get('notes')

// 		if (notes.length != 0) {
// 			notes.forEach(note => {
// 				manageNotes.addNote(note)
// 			})
// 		}
// 	}
// }

// let [navigate] = performance.getEntriesByType('navigation')
// if ((navigate.type === 'navigate') || (navigate.type == 'reload')) {

// 	db.notis.clear()
// 	db.notes.clear()

// 	let studentDocID = Cookies.get('recordID').split(':')[1].replaceAll('"', '')
// 	let studentID = Cookies.get('studentID')

// 	fetch(`/api/getNote?type=save&studentDocID=${studentDocID}`) // 1.1
// 		.then(response => response.json())
// 		.then(notes => {
// 			notes.forEach(note => {
// 				let noteData = {
// 					noteID: note._id,
// 					noteTitle: note.title,
// 				}
// 				manageDb.add('savedNotes', noteData)
// 			})
// 		})
// 		.catch(error => console.log(error.message))

// 	fetch(`/api/getNotifs?studentID=${studentID}`)
// 		.then(response => response.json())
// 		.then(notifs => {
// 			notifs.forEach(noti => {
// 				let isVote = noti.docType === "note-vote" ? true : false
// 				let _notiData = {
// 					notiID: noti._id,
// 					isread: noti.isRead,
// 					noteID: noti.noteDocID._id,
// 					nfnTitle: noti.noteDocID.title
// 				}
// 				let notiData = !isVote ? {
// 					..._notiData,
// 					feedbackID: noti.feedbackDocID,
// 					commenterUserName: noti.commenterDocID.username,
// 					commenterDisplayName: noti.commenterDocID.displayname
// 				} : _notiData
// 				manageDb.add('notis', notiData)
// 			})
// 		})

// } else if (navigate.type === 'back_forward') {
// 	back_forward_note_add.addSavedNotes()
// 	back_forward_note_add.addNotis()
// 	back_forward_note_add.addUNotes()
// }


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


