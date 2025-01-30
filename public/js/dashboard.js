const host = window.location.origin
const socket = io(host)

socket.on('update-upvote-dashboard', function (noteDocID, upvoteCount) {
	let noteCard = document.querySelector(`#note-${noteDocID}`)
	if (noteCard) {
		noteCard.querySelector(".uv-count").innerHTML = parseInt(upvoteCount)
	}
})

async function get_note(count, page) {
	function getFeedbackNoteObject(note) {
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
		}
		return noteData
	}
	
	let notesList = [];

	try {
		let response = await fetch(`/api/getnote?type=seg&page=${page}&count=${count}`); // 1
		let notes = await response.json(); 

		if (notes.length !== 0) {
			notes.forEach(note => {
				notesList.push(getFeedbackNoteObject(note)); 
			});
		}
	} catch (error) {}

	return notesList; 
}


window.addEventListener('load', async () => {
	async function initialFeedSetup() {
		let feedContainer = document.querySelector('.feed-container')
		let notes = await get_note(3, 1)
		notes.forEach(note => {
			manageNotes.addNote(note)
		})
		observers.lastNoteObserver().observe(feedContainer.lastElementChild) // Initial tracking of the last note
	}
	await initialFeedSetup()

	async function getSavedNotes() {
		let response = await fetch('/api/note?noteType=saved')
		let savedNotes = await response.json()
		savedNotes.forEach(note => {
			manageDb.add('savedNotes', note)
		})
	}
	
	await getSavedNotes()
})


//* Observer's object
const observers = {
	observer: function () {
		const _observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					let image = entry.target.querySelector('.thumbnail-container .thumbnail')
					let imageURL = image.getAttribute('data-src')

					image.onload = function () {
						image.parentElement.querySelector('.thumbnail-loading').style.display = 'none' // skeleton loader
						image.style.display = 'flex'
					}

					image.src = imageURL 
					image.removeAttribute('data-src')
					_observer.unobserve(entry.target)
				}
			})
		}, {
			rootMargin: "300px" 
		})
		return _observer
	},

	lastNoteObserver: function () {
		let feedContainer = document.querySelector('.feed-container')

		const _observer = new IntersectionObserver(async entries => {
			entries.forEach(async entry => {
				if (entry.isIntersecting) {
					let nextPage = parseInt(feedContainer.children.length / 3) + 1
					let notes = await get_note(3, nextPage)
					notes.forEach(note => {
						manageNotes.addNote(note)
					})

					_observer.unobserve(entry.target)
					_observer.observe(feedContainer.lastElementChild)
				}
			})
		}, {
			threshold: 1
		})
		return _observer
	}
}


//* Note upload WS event
socket.on('note-upload', (noteData) => {
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


