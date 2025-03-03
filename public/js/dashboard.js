const host = window.location.origin
const socket = io(host)

socket.on('update-upvote-dashboard', function (noteDocID, upvoteCount) {
	let noteCard = document.querySelector(`#note-${noteDocID}`)
	if (noteCard) {
		noteCard.querySelector(".uv-count").innerHTML = parseInt(upvoteCount)
	}
})


const navigate = performance.getEntriesByType("navigation")[0]

let nextPage = Number(localStorage.getItem('feedLastPageFetched') || "0") + 1
let seed = null

if (navigate?.type === "reload") {
	const newUrl = window.location.origin + window.location.pathname
	window.history.replaceState({}, document.title, newUrl);
}

if (navigate?.type === "reload" || navigate?.type === "navigate") {
	const now = new Date();
	const baseSeed = Math.floor(now.getTime() / 3600000);
	seed = (baseSeed * 104729) % 999999937;

	const previousSeed = Number(localStorage.getItem('feedNoteLastFetchSeed'))
	if (!previousSeed || seed !== previousSeed) {
		db.feedNotes.clear()
		localStorage.setItem('feedLastPageFetched', 1)
	}
} else {
	seed = parseInt(localStorage.getItem('feedNoteLastFetchSeed'))
}

let seqCount = 0
async function get_note(page) {
	let notesList = [];
	let cacheNoteList = []

	try {
		let response = await fetch(`/api/getnote?seed=${seed}&page=${page}`); 
		let notes = await response.json(); 
		
		if (notes.length !== 0) {
			for (let note of notes) {
				seqCount += 1
				let feedNote = {...new FeedNote(note), count: seqCount}
				notesList.push(feedNote);
				
				let { noteData, contentData, ownerData, interactionData, extras, count } = feedNote
				cacheNoteList.push({ noteID: noteData.noteID, noteData, contentData, ownerData, interactionData, extras, count })
			}
			
			localStorage.setItem('feedNoteLastFetchSeed', seed)
			localStorage.setItem('feedLastPageFetched', page)
			await (new ManageFeedCache()).addFeedNotes(cacheNoteList)
		} else {
			document.querySelector('#feed-note-loader').style.display = 'none'
			document.querySelector('#finish-message').style.display = 'flex'
			observers.lastNoteObserver().disconnect()
		}
	} catch (error) {}

	return notesList; 
}

async function initialFeedSetup() {
	let feedNotes = await (new ManageFeedCache()).getCachedFeedNotes()
	let feedContainer = document.querySelector('.feed-container')
	let previousSeed = localStorage.getItem('feedNoteLastFetchSeed')
	
	if (feedNotes && feedNotes.length !== 0 && parseInt(previousSeed) === seed) {
		feedNotes.forEach(note => manageNotes.addNote(note) )
	} else {
		let notes = await get_note(1)
		notes.forEach(note => manageNotes.addNote(note) )
	}
	observers.lastNoteObserver().observe(feedContainer.lastElementChild)
}
initialFeedSetup().then(() => {
	let scrollToID = new URL(window.location.href).searchParams.get('scroll')
	let noteToScroll = document.querySelector(`#note-${scrollToID}`)

	if (scrollToID && noteToScroll) {
		noteToScroll.scrollIntoView({ behavior: "instant", block: "start" })
	}

	let feedContainer = document.querySelector('.feed-container')
	feedContainer.querySelectorAll('.feed-note-card').forEach(note => {
		observers.noteObserver().observe(note)
	})
})


window.addEventListener('load', async () => {	
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
			seqCount = await (new ManageFeedCache()).getLastCount()
			entries.forEach(async entry => {
				if (entry.isIntersecting) {
					let notes = await get_note(nextPage)
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
	},

	noteObserver: function() {
		let _observer = new IntersectionObserver(entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting && entry.intersectionRatio === 1) {
					const newUrl = window.location.origin + window.location.pathname + `?scroll=${entry.target.getAttribute('data-noteid')}`;
					window.history.replaceState({}, document.title, newUrl);
				}
			})
		}, { threshold: 1.0 })

		return _observer
	} 
}


socket.on('note-upload', (feedNote) => {
	manageNotes.addNote(feedNote)

	let { noteData, contentData, ownerData, interactionData, extras } = feedNote
	manageDb.add('feedNotes', { noteID: noteData.noteID, noteData, contentData, ownerData, interactionData, extras })
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


