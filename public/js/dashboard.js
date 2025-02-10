const host = window.location.origin
const socket = io(host)

socket.on('update-upvote-dashboard', function (noteDocID, upvoteCount) {
	let noteCard = document.querySelector(`#note-${noteDocID}`)
	if (noteCard) {
		noteCard.querySelector(".uv-count").innerHTML = parseInt(upvoteCount)
	}
})

let nextPage = 2
const now = new Date();
const baseSeed = Math.floor(now.getTime() / 3600000);
const seed = (baseSeed * 7919 + now.getMinutes() * 37) % 999999937;

async function get_note(count, page) {
	function getFeedbackNoteObject(note) {
		let quickPost = note.postType === "quick-post"
		let noteData = {
			noteID: note._id,
			noteTitle: !quickPost ? note.title : null,
			description: note.description,
			createdAt: note.createdAt,

			content1: quickPost || note.content.length > 1 ? note.content[0] : null ,
			content2: !quickPost ? note.content[1] : null,
			contentCount: note.content.length,

			ownerID: note.ownerDocID.studentID,
			profile_pic: note.ownerDocID.profile_pic,
			ownerDisplayName: note.ownerDocID.displayname,
			ownerUserName: note.ownerDocID.username,
			isOwner: note.isOwner,

			feedbackCount: note.feedbackCount,
			upvoteCount: note.upvoteCount,
			isSaved: note.isSaved,
			isUpvoted: note.isUpvoted,

			quickPost: quickPost
		}
		return noteData
	}
	
	let notesList = [];

	try {
		let response = await fetch(`/api/getnote?type=seg&seed=${seed}&page=${page}&count=${count}`); 
		let notes = await response.json(); 
		
		if (notes.length !== 0) {
			notes.forEach(note => {
				notesList.push(getFeedbackNoteObject(note, true));
			});
		} else {
			document.querySelector('#feed-note-loader').style.display = 'none'
			document.querySelector('#finish-message').style.display = 'flex'
			observers.lastNoteObserver().disconnect()
		}
	} catch (error) {}

	return notesList; 
}

window.addEventListener('load', async () => {
	async function initialFeedSetup() {
		let feedContainer = document.querySelector('.feed-container')
		let notes = await get_note(7, 1)
		notes.forEach(note => {
			manageNotes.addNote(note)
		})
		observers.lastNoteObserver().observe(feedContainer.lastElementChild) // Initial tracking of the last note
	}
	
	async function getResourcees(collection) {
		let response = await fetch(collection.api)
		let objects = (await response.json()).objects
		
		for (const object of objects) {
			await manageDb.add(collection.store, object);
		}
	}
	
	try {
		await getResourcees({api: '/api/note?noteType=saved', store: 'savedNotes'})
		await getResourcees({api: '/api/note?noteType=owned', store: 'ownedNotes'})
		await getResourcees({api: '/api/notifs', store: 'notifications'})
		await getResourcees({api: '/api/request/get', store: 'requests'})
	} finally {
		document.querySelector('#is-script-loaded').setAttribute('data-loaded', 'true')
		await initialFeedSetup()
	}
})


const observers = {
	observer: function () {
		const _observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				let isQuickPost = entry.target.getAttribute('data-posttype') === 'quick-post' ? true : false
				if (!isQuickPost) {
					let thumbnails = entry.target.querySelectorAll('.thumbnail')
					let imageUrls = []
	
					thumbnails.forEach(thumbnail => {
						let imageurl = thumbnail.getAttribute('data-src')
						imageUrls.push(imageurl)
					})
					
					entry.target.querySelector('.thumbnail-grid').style.display = 'grid'					
					entry.target.querySelector('.primary-img').src = imageUrls[0]
					entry.target.querySelector('.secondary-img').src = imageUrls[1]
				} else {
					let thumbnail = entry.target.querySelector('.quickpost-thumbnail')
					if (thumbnail) {
						let imageUrl = thumbnail.getAttribute('data-src')
						thumbnail.src = imageUrl
					}
				}

				_observer.unobserve(entry.target)
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
					let notes = await get_note(7, nextPage)
					if (notes.length !== 0) {
						notes.forEach(note => {
							manageNotes.addNote(note)
						})
						nextPage += 1
						_observer.unobserve(entry.target)
						_observer.observe(feedContainer.lastElementChild)
					} else {
						_observer.disconnect()
					}
				}
			})
		}, {
			threshold: 1
		})
		return _observer
	}
}


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


