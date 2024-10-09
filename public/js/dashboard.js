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



/*
* Navigation capture and real time loading
# Process:
~	=> when the page gets reload, first the saved notes data is fetched and added in LS|key=savedNotes (1.1). it helps to add save class
~		in the saved notes buttons. also empty lists are added in LS|key=addedNotes and LS|key=notis (1.2)

~	=> when a back_forward is captured, means when the user comes to dashboard without reloading and only using back-button, all the
~		data from LS is fetched. there are 3 types of data, all are list of objects form
~			1. addedNotes: notes which are uploaded by other users (without reloading, not the one from the database) => isAddNote=true
~			2. savedNotes: notes saved by the user => isSaveNote=true
~			3. notis: notifications got at real time (without reloading, not the one from the database) => isNoti=true

~		mapping through them, if isAddNote=true, the note gets added in the dashboard (if there is no note with that id, usefull for chrome) (2.1).

~		if isSavedNote=true, first the no-notes-message is removed (2.2), then it gets added in the left-panel (if not already added) (2.3) and lastly
~		the save class is added in the save button (2.4).

~		if isNoti=true, the noti. object is added in the right-panel. (2.5)
*/
let saved_notes = []
let [navigate] = performance.getEntriesByType('navigation')
if ((navigate.type === 'navigate') || (navigate.type == 'reload')) {
	localStorage.clear()

	let studentDocID = Cookies.get('recordID').split(':')[1].replaceAll('"', '')
	fetch(`/getNote?type=save&studentDocID=${studentDocID}`) // 1.1
		.then(response => response.json() )
		.then(notes => {
			notes.forEach(note => {
				let noteData = {
					noteID: note._id,
					noteTitle: note.title,
					isSavedNote: true 
				}	
				saved_notes.push(noteData)
				savedNotes.push(noteData.noteID)
			})
			localStorage.setItem('savedNotes', JSON.stringify(saved_notes)) // 1.1
			localStorage.setItem('notis', JSON.stringify([])) // 1,2
			localStorage.setItem('addedNotes', JSON.stringify([])) // 1.2
		})
		.catch(error => console.log(error.message))

} else if (navigate.type === 'back_forward') {
	let Datas = Object.keys(localStorage).filter(key => !key.includes('twk')).map(key => localStorage.getItem(key))
	Datas.forEach(CardStr => {
		let data = JSON.parse(CardStr)
		data.map(note => {
			if(note.isAddNote) { // 2.1
				let existingNote = document.querySelector(`#note-${note.noteID}`)
				if(existingNote === null) {
					manageNotes.addNote(note)
				}
			} 
			else if(note.isSavedNote) {
				let noSavedNoteMessage = document.querySelector('.no-saved-notes-message')
				if(noSavedNoteMessage) {
					noSavedNoteMessage.style.display = 'none' // 2.2
				}
				if(manageStorage.isExists('savedNotes', note.noteID)) {
					let existingNote = document.querySelector(`#saved-note-${note.noteID}`)
					if(existingNote === null) {
						manageNotes.addSaveNote(note) // 2.3
						let saveBtn = document.querySelector(`#save-btn-${note.noteID}`)
						if(saveBtn) {
							saveBtn.classList.add('saved') // 2.4
						}
					}
				}	
			} 
			else if(note.isNoti) {
				manageNotes.addNoti(note) // 2.5
			} 
		})
	})
}



//* save/delete a note
function saveNote(noteDocID) {
	/*
	# Process:
	~	the noteID is sent when clicking the save button. first if the note is already saved or not is checked. this is checked by if the button has a class 
	~	save or not (1). if has, the button acts like a save button, otherwise works like a delete button. 
	~	after clicking save button, save class is added, then the prepared saved note object is added in LS|key=savedNotes, then adding to front-end, sending 
	~	WS event to save the data in database. and lastly, if there are any no-saved-note msg, it gets removed.

	~	clicking the delete button, WS event is raised to delete the data from db, removing save class from button, removing data from LS, and then removing
	~	element from front-end. then if the LS|key=savedNotes has 0 contents, the no-saved-notes msg is shown (created if not exists)
	*/

    let button = document.querySelector(`#save-btn-${noteDocID}`);
    let recordID = Cookies.get('recordID').split(':')[1].replaceAll('"', '');
	let noSavedNotesMsg = document.querySelector('.no-saved-notes-message')

    if (!button.classList.contains('saved')) { // 1
        button.classList.add('saved'); // adding saved class
        let noteData = {
            noteID: noteDocID,
            noteTitle: document.querySelector(`#note-${noteDocID} .note-title a`).innerHTML,
            isSavedNote: true 
        };

        manageStorage.update('savedNotes', undefined, 'insert', noteData); // adding to localstorage
        manageNotes.addSaveNote(noteData); // adding to document
        socket.emit('save-note', recordID, noteDocID); // adding to database
		if(noSavedNotesMsg) {
			noSavedNotesMsg.style.display = 'none' // removing no-saved-notes msg
		}

    } else {
        socket.emit('delete-saved-note', recordID, noteDocID); // removing from db
        button.classList.remove('saved'); // removing saved class
        manageStorage.update('savedNotes', noteDocID, 'remove', undefined, 'note'); // removing from localstorage
        document.querySelector(`#saved-note-${noteDocID}`).remove(); // removing from frontend

		if(manageStorage.getContentLength('savedNotes') == 0) {
			if(noSavedNotesMsg) {
				noSavedNotesMsg.style.display = 'block' // showing no no-notes-saved if there are no saved notes left
			} else {
				document.querySelector('.saved-notes-container').insertAdjacentHTML('beforeend', `
					<div class="no-saved-notes-message">
                  		<p>It looks like you haven't saved any notes yet.</p>
                  		<p>Start saving <span class="anim-bg">important notes</span> to easily access them later!</p>
                	</div>
				`) // creating no-saved-notes if there isn't any
			}
		}
    }
}


//* Triggering all the observers
document.querySelectorAll('.feed-note-card').forEach(card => {
	observers.observer().observe(card)
})
observers.lastNoteObserver().observe(document.querySelector('.feed-note-card:last-child'))


//* Note upload WS event
socket.on('note-upload', (noteData) => {
	/*
	# Process: when a note is uploaded, this event is handled by every online user
	~	first the data is added as isAddNote in LS|key=addedNotes. then it is added in the dashboard.
	*/
	noteData.isAddNote = true 
	manageStorage.update('addedNotes', undefined, 'insert', noteData)
	manageNotes.addNote(noteData)
})



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
