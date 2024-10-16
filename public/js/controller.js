const conHost = window.location.origin
const conSock = io(conHost)

//* Badge images: user-profile + search-profile
let baseURL = 'https://storage.googleapis.com/noteroom-fb1a7.appspot.com/badges/'
let imageObject = {
    'No Badge': `${baseURL}no-badge.png`,
    'Biology': `${baseURL}biology.png`,
    'English': `${baseURL}english.png`
}



//* Description or Bio truncater function
function truncatedTitle(title) {
    const titleCharLimit = 30;
    let truncatedTitle =
      title.length > titleCharLimit
        ? title.slice(0, titleCharLimit) + "..."
        : title;
    return truncatedTitle
}



//* Local Storage manager object
const manageStorage = {
    /* 
    # Functions:
        => add: adds a stringified object in the localStorage under a given key
        => getContent: returns a list of objects under a key
        => update: updates an entry under a key, either insert an object in a list or remove an object from that list
            # process: key is must
        ~       insert: id has to be undefined cause everytime an object will be inserted. so, object can't be undefined. 
        ~               method=insert. after getting the content under that key, the object will be pushed and updated in LS.
        ~               type is not needed
        ~       remove: method=remove, object has to be undefined cause object removal is dependent on id(noteID or notiID). 
        ~               so, id can't be undefined. if type=undefined then id will refer notiID which is default. if type=note 
        ~               then id will refer noteID. after getting type and id, the object with that id will be filtered out 
        ~               and pused, updated in LS
        => isExists: checks if an object exists in a list under a key or not. The object is identified ONLY BY ITS NOTEID 
        => getContentLength: returns the amount of objects in a list under a key
    */

    add: function(key, object) {
        localStorage.setItem(key, JSON.stringify(object))
    },
    getContent: function(key) {
        let values = JSON.parse(localStorage.getItem(key))
        return values
    },
    update: function(key, id=undefined, method, object=undefined, type=undefined) {
        if(method === 'insert') {
            let values = this.getContent(key)
            if((object !== undefined) && (id === undefined)) {
                values.push(object)
                this.add(key, values)
            }
        } else if(method === 'remove') {
            if(object === undefined) {
                let values = this.getContent(key)
                let modifiedDocs;
                if(type == undefined) {
                    modifiedDocs = values.filter(item => item.notiID != id) // after remove
                } else if(type == 'note') {
                    modifiedDocs = values.filter(item => item.noteID != id) // after remove
                }
                this.add(key, modifiedDocs)
            }
        } 
    },
    isExists: function(key, noteID) {
        let values = this.getContent(key)
        let noteData = values.find(item => item.noteID == noteID)
	    return !(noteData == undefined)
    },
    getContentLength: function(key) {
        return this.getContent(key).length
    }
}



//* The main dynamic content loading manager object
const manageNotes = { // I treat all the cards as notes
    /* 
    # Functions:
        => addNote: adds note in the dashboard
            # process:
        ~       notes are added with this function in 2 scenerios. One is after back_forward and another is lazy loading.
        ~       first the note will be added (1) and then the lazy loading oserver will be triggered for that specific note. (2)
    
        => addSaveNote: adds note in the left-panel
        => addNoti: adds a notification in the right-panel
        => addProfile: adds profiles when searched in search-profile
        => addFeedback: adds feedback in notes in note-view
    */

	addNote: function(noteData) { 
		let noteCardsHtml = `
					<div class="feed-note-card" id="note-${noteData.noteID}">
						  <div class="thumbnail-container">
							  <div class="thumbnail-loading">
								  <svg className="w-10 h-10" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18">
									  <path 
										  d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" 
										  style="fill: hsl(0, 0%, 80%);" 
									  />
								  </svg>
							  </div>
							  <img class="thumbnail" data-src="${noteData.thumbnail}" onclick="window.location.href='/view/${noteData.noteID}'" > 
							  <button class="save-note-btn" id="save-btn-${noteData.noteID}" onclick="saveNote('${noteData.noteID}')">
								  <i class="fa-regular fa-bookmark"></i>
								  <i class="fa-solid fa-bookmark saved"></i>
							  </button>
						  </div>
					  <div class="note-details">
						  <div class="author-info">
							  <img src="${noteData.profile_pic}" class="author-img">
							  <div class="author-title-container">
								  <div class="note-title"><a href="/view/${noteData.noteID}" onclick='location.reload()'>${truncatedTitle(noteData.noteTitle)}</a></div>
								  <div class="author"><a class="author-prfl-link" href="/user/${noteData.ownerID}">${noteData.ownerDisplayName}</a></div>
							  </div>
						  </div>
						  <div class="note-engagement">
							  <svg class="download-icon" width="40" height="40" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg" onclick="download('${noteData.noteID}', '${noteData.noteTitle}')">
								  <path d="M37.1541 26.5395V33.6165C37.1541 34.555 36.7813 35.455 36.1177 36.1186C35.4541 36.7822 34.5541 37.155 33.6156 37.155H8.84623C7.90776 37.155 7.00773 36.7822 6.34414 36.1186C5.68054 35.455 5.30774 34.555 5.30774 33.6165V26.5395M12.3847 17.6933L21.2309 26.5395M21.2309 26.5395L30.0771 17.6933M21.2309 26.5395V5.30859" stroke="#1E1E1E" stroke-width="2.29523" stroke-linecap="round" stroke-linejoin="round"/>
							  </svg>
							  <svg onclick="window.location.href='/view/${noteData.noteID}/#feedbacks';" class="comment-icon" width="40" height="40" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
								  <path d="M34.4051 23.9151C34.4051 24.8838 34.0257 25.8128 33.3505 26.4978C32.6753 27.1828 31.7595 27.5676 30.8045 27.5676H9.20113L2 34.8726V5.65252C2 4.68381 2.37934 3.75478 3.05458 3.0698C3.72982 2.38482 4.64564 2 5.60057 2H30.8045C31.7595 2 32.6753 2.38482 33.3505 3.0698C34.0257 3.75478 34.4051 4.68381 34.4051 5.65252V23.9151Z" stroke="#1E1E1E" stroke-width="2.40038" stroke-linecap="round" stroke-linejoin="round"/>
							  </svg>
							  <svg class="share-icon" width="40" height="40" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" onclick="setupShareModal('${noteData.noteID}')">
								  <path d="M30.6079 32.5223L27.8819 29.8441L36.6816 21.0444L27.8819 12.2446L30.6079 9.56641L42.0858 21.0444L30.6079 32.5223ZM3.82599 36.3483V28.6963C3.82599 26.05 4.7506 23.8023 6.59983 21.953C8.48094 20.0719 10.7446 19.1314 13.391 19.1314H25.2037L18.3169 12.2446L21.0429 9.56641L32.5209 21.0444L21.0429 32.5223L18.3169 29.8441L25.2037 22.9574H13.391C11.7968 22.9574 10.4418 23.5153 9.32584 24.6312C8.20993 25.7471 7.65197 27.1022 7.65197 28.6963V36.3483H3.82599Z" fill="#1D1B20"/>
							  </svg>
						  </div>            
					  </div>
				  </div> `; 

		document.querySelector('.feed-container').insertAdjacentHTML('beforeend', noteCardsHtml); // 1

		let newNoteCard = document.querySelector('.feed-note-card:last-child')
		observers.observer().observe(newNoteCard) // 2
		document.querySelector('.fetch-loading').style.display = 'flex'
	},

	addSaveNote: function(noteData) { 
		let savedNotesContainer = document.querySelector(".saved-notes-container");
		let savedNotesHtml = `
			<div class="saved-note hide" id="saved-note-${noteData.noteID}">
				<span class="sv-note-title">
					<a class="sv-n-link" href='/view/${noteData.noteID}'>${truncatedTitle(noteData.noteTitle)}</a>
				</span>
			</div>`;
		savedNotesContainer.insertAdjacentHTML('afterbegin', savedNotesHtml);
		const newNote = document.getElementById(`saved-note-${noteData.noteID}`);
		
		// Remove the hide class and add the transition class after a short delay
		setTimeout(() => {
			if (newNote) {
				newNote.classList.remove('hide'); 
				newNote.classList.add('show-sv-in-LP');
			}
		}, 50);
	},

    addNoti: function (feedbackData) {
        let notificationHtml = `
              <div class="notification" id="noti-${feedbackData.notiID}">
                  <span class='feedback-id' style="display: none;">${feedbackData.feedbackID}</span>
                  <div class="first-row">
                    <a href='/view/${feedbackData.noteID}/#${feedbackData.feedbackID}' class="notification-link">
                      <span class="notification-title">
                      ${truncatedTitle(feedbackData.nfnTitle)}
                      </span>
                    </a>  
                    <span class="remove-notification" onclick="deleteNoti('${feedbackData.notiID}')">&times;</span>
                  </div>
                  <div class="notification-msg">
                    <a href='/user/${feedbackData.commenterStudentID}' class="commenter-prfl">
                    ${feedbackData.commenterDisplayName}
                    </a><a href='/view/${feedbackData.noteID}/#${feedbackData.feedbackID}' class="notification-link-2"> has given feedback on your notes! Check it out.</a>
                  </div>
              </div>`
        document.querySelector('.notifications-container').insertAdjacentHTML('afterbegin', notificationHtml);
    },

    addProfile: function(student) {
        let profileCard = `
                    <div class="results-prfl">
                        <img src="${student.profile_pic}" alt="Profile Pic" class="prfl-pic">
                        <span class="prfl-name" onclick="window.location.href = '/user/${student.studentID}'">${student.displayname}</span>
                        <span class="prfl-desc">${truncatedTitle(student.bio)}</span>
                        <span class="badge" style="display: none;">${student.badge}</span>
                        <img src="" alt="" class="user-badge">
                    </div>`
        document.querySelector('.results-prfls').insertAdjacentHTML('beforeend', profileCard);
    },

    addFeedback: function(feedbackData) {
        let date = new Date(feedbackData.createdAt)
        const formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Dhaka', 
            hour12: true 
        });
        const formattedDate = formatter.format(date);
        let feedbackCard = `<div class="feedback" id="${feedbackData._id}">
							<div class="feedback-header">
                            	<span class="feedback-id" style="display: none;">${feedbackData._id}</span>
								<img src="${feedbackData.commenterDocID.profile_pic}" alt="User Avatar" class="feedback-avatar">
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
    }
}



//* Download: Dashboard + Note View
async function download(noteID, noteTitle) {
    /* 
    # Process:
    ~   the noteID and title are given when clicking the download button. After getting them, a fetch request is sent
    ~   the server processes that and in that meantime, the animation is started and run until it gets downloaded.
    ~   all the images are sent in a zip file and the zip is then downloaded.
    */

    start() // start of animation

    try {
        let noteDetailes = new FormData()
        noteDetailes.append('noteID', noteID)
        noteDetailes.append('noteTitle', noteTitle)
    
        let response = await fetch('/download', {
            method: 'POST',
            body: noteDetailes
        })
        
        let blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
    
        link.href = url
        link.setAttribute('download', `${noteTitle}.zip`)
    
        document.body.appendChild(link)
        link.click()
        link.remove()
    
        URL.revokeObjectURL(url)    
    } catch (error) {
        console.error(error)
    } finally {
        finish() // end of animation
    }
}
function start() {
    document.querySelector('.download-status').style.display = 'flex'
}
function finish() {
    document.querySelector('.download-status').style.display = 'none'
}



/* 
* Share Model: Dashboard + Note View
# Funtions:
    => copy: copies the url of the note (copyLink)
    => share: shares the note in fb or whatsapp (share)
        # process
    ~       when fb/wp is clicked, the platform is also sent, the link from the _link_ element is grabed (1) and based on 
    ~       the platform a share link is created and a new window is opened to share the link. (2)
*/
const linkElement = document.querySelector('._link_');
function setupShareModal(noteID) {
    const shareNoteModal = document.querySelector('.share-note-overlay');
    const closeNoteModalBtn = document.querySelector('.close-share-note-modal');

    if (!shareNoteModal || !closeNoteModalBtn || !linkElement) {
        console.error('One or more required elements are not found');
        return;
    }

    // Open the modal and populate the link (immediate execution)
    shareNoteModal.style.display = 'flex'; 
    linkElement.innerHTML = `${window.location.origin}/view/${noteID}`;
    requestAnimationFrame(() => { 
        shareNoteModal.classList.add('visible');
    });

    closeNoteModalBtn.addEventListener('click', () => {
        shareNoteModal.classList.remove('visible');
        setTimeout(() => {
            shareNoteModal.style.display = 'none'; 
        }, 300); // Matches CSS transition duration
    });
}
function copyLink() {
    const linkElement = document.querySelector('._link_');
    const successfulLinkMsg = document.querySelector('.successful-copy');

    navigator.clipboard.writeText(linkElement.textContent)
        .then(() => {
            
                successfulLinkMsg.style.display = 'flex';
                
                requestAnimationFrame(() => {
                    successfulLinkMsg.classList.add('s-c-effect');
                });
    
                setTimeout(() => {
                    successfulLinkMsg.classList.remove('s-c-effect');
                    setTimeout(() => {
                        successfulLinkMsg.style.display = 'none';
                    }, 400); 
                }, 2000);
            
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}
function share(platform) {
    const linkElement = document.querySelector('._link_').innerHTML; // 1
    let messages = [
        `Check out this note on NoteRoom: ${linkElement}`,
        `Explore this amazing note on NoteRoom: ${linkElement}`,
        `Take a look at this note I found on NoteRoom: ${linkElement}`,
        `Don't miss this note on NoteRoom! Check it out here: ${linkElement}`,
        `Here's something worth reading on NoteRoom: ${linkElement}`,
        `Check out this awesome note on NoteRoom: ${linkElement}`,
        `I came across this great note on NoteRoom, have a look: ${linkElement}`,
        `Found something interesting on NoteRoom! See it here: ${linkElement}`,
        `This note on NoteRoom is worth your time: ${linkElement}`,
        `Take a moment to check out this note on NoteRoom: ${linkElement}`,
        `Here's a note you'll find interesting on NoteRoom: ${linkElement}`
    ]
    
    switch(platform) {
        case "facebook":
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkElement + '/shared')}`, '_blank') // 2
            break
        case "whatsapp":
            let message = messages[_.random(0, 9)]
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank') // 2
            break
    }
}


 
//* Search Notes: All Pages
async function searchNotes() {
    /* 
    # Process:
    ~   when the search bar is clicked, an empty dropdown is opened (1). after clicking (either the enter/search button), the text is sent
    ~   to the server via fetch request (2). the server returns possible notes in a json format (3). if there are notes returned, the notes'
    ~   details are added in the dropdown (4). ottherwise, a message is shown that no notes are found (5). Also a loading runs in between the
    ~   note fetching.
    */
    let searchedResults = document.querySelector('.search-results')
    let existingNotes = searchedResults.querySelectorAll('div.results-card')
    let status = document.querySelector('.status')

    if(existingNotes) {
        existingNotes.forEach(note => {
            note.remove()
        })
    }
    let searchTerm = document.querySelector('.search-bar').value
    if(searchTerm.length > 0) {
        status.style.display = 'flex' // Start of loading
        let response = await fetch(`/search?q=${encodeURIComponent(searchTerm)}`) // 2
        let notes = await response.json() // 3
        status.style.display = 'none' // End of loading
        if(notes.length > 0) {
            status.style.display = 'none'
            notes.forEach(note => {
                searchedResults.insertAdjacentHTML('afterbegin', `
                    <a href="/view/${note._id}" style="text-decoration: none;">
                        <div class="results-card" id="note-${note._id}">
                            <p class="result-note-title">${note.title}</p>
                            <i class="fa-solid fa-arrow-up"></i>
                        </div>
                    </a>
                `) // 4
            })
        } else {
            searchedResults.insertAdjacentHTML('afterbegin', `
                <div class='results-card'>
                    <p>Oops! No notes found for "${searchTerm}". Try searching with different keywords or explore other subjects!</p>
                </div>
            `) // 5
        }
    }
}

try {
    let searchBtn = document.querySelector('.search-btn');
    let noteSearchInput = document.querySelector('.search-bar');
    let resultsContainer = document.querySelector('.results-container');
    
    /*
    # Process:
    1. Show the dropdown when the search bar is focused.
    2. Trigger the search when the 'Enter' key is pressed inside the search bar.
    3. Trigger the search when the search button is clicked and prevent dropdown from hiding.
    4. Hide the dropdown if the user clicks outside the search bar or the dropdown.
    5. Prevent the dropdown from hiding when interacting with the dropdown itself.
    */
    
    // Step 1: Show the results container on input focus
    noteSearchInput.addEventListener('focus', function() {
        resultsContainer.style.display = 'flex'; // Show dropdown
    });
    
    // Step 2: Trigger search when pressing 'Enter'
    noteSearchInput.addEventListener('keydown', (event) => {
        if(event.key === 'Enter') {
            searchNotes(); // Call search function
        }
    });
    
    // Step 3: Prevent dropdown from hiding and trigger search on search button click
    searchBtn.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent dropdown from hiding
        searchNotes(); // Call search function
    });
    
    // Step 4: Hide the dropdown if clicking outside of input and results container
    document.addEventListener('click', function(event) {
        if (!noteSearchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
            resultsContainer.style.display = 'none'; // Hide dropdown
        }
    });
    
    // Step 5: Prevent dropdown from hiding when interacting with the results container
    resultsContainer.addEventListener('click', function(event) {
        event.stopPropagation(); // Stop clicks inside the dropdown from closing it
    });    
} catch (error) {
    console.log(error.message)
}





//* Delete notifications: all pages
function deleteNoti(id) {
    /* 
    # Process:
    ~   when clicking the delete noti. button, the notiID is sent. an WS event occurs to delete the notification with that id. (1)
    ~   them that notification is removed from the frontend DOM (2). last, the noti. object is removed from the LS (3)
    */
    conSock.emit('delete-noti', id) // 1
	document.querySelector(`#noti-${id}`).remove() // 2
	manageStorage.update('notis', id, 'remove') //3 

    notificationCount--;
    updateNotificationBadge(); // 2
}



//* Adding notifications: all pages
let notificationCount = 0;
function addNoti(feedbackData) {
    /* 
    # Process: The main function is manageNotes.addNoti. Related to feedback-given WS event
    ~   the noti. data is got via feedback-given WS event. the process handles the main addNoti funnction (1). then the number got increased
    ~   and shown in the noti. badge (2)
    */
    manageNotes.addNoti(feedbackData) // 1
    notificationCount++;
    updateNotificationBadge(); // 2
}
function updateNotificationBadge() {
    const badge = document.getElementById('notification-count');
    if (badge) {
        badge.textContent = notificationCount;
        if (notificationCount > 0) {
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    } else {
        console.error('Notification badge element not found');
    }
}

//* Event that will trigger when someone gives a feedback to a note: all pages, related to addNoti
conSock.on('feedback-given' , (feedbackData) => {
    /* 
    # Process: ARP Protocol structure
    ~   the event is handled by every user. the WS is sent with the feedback data and every browser checks, if the recordName
    ~   cookie which is the logged in user's unique username is as same as the note owner's username which is sent in the feedback
    ~   object (1). If so, that means the noti. has found it's owner. the noti-data is added in LS|key=notis (2). then it is added
    ~   in the right-panel (3). then the noti. button got shaked(mobile) (4).
    */
	if (feedbackData.ownerUsername == Cookies.get('recordName')) { // 1
		feedbackData.isNoti = true
		manageStorage.update('notis', undefined, 'insert', feedbackData) // 2
		addNoti(feedbackData) // 3

		const nftShake = document.querySelector('.mobile-nft-btn')
		nftShake.classList.add('shake') // 4
		setTimeout(() => {
			nftShake.classList.remove('shake');
		}, 300)
        
        try {
            const audio = document.getElementById('notificationAudio');
            audio.play();
        } catch (error) {
            console.error(error)
        }
	}
})


try {
    //* Mobile notification panel
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
} catch (error) {
    console.log(error.message)
}



function setupErrorPopup(errorMessage) {
    const errorOverlay = document.querySelector('.error-overlay');
    const closeErrorBtns = document.querySelectorAll('.close-err'); 
    const errorMsgElement = document.querySelector('.error-msg');

    errorMsgElement.innerHTML = errorMessage || "An unexpected error occurred."; // Default message if none provided. In case someone is playing with the functions on the console :)

    errorOverlay.style.display = 'flex'; 
    requestAnimationFrame(() => { 
        errorOverlay.classList.add('err-visible');
    });

    closeErrorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            errorOverlay.classList.remove('err-visible');
            setTimeout(() => {
                errorOverlay.style.display = 'none'; 
            }, 300); 
        });
    });

    errorOverlay.addEventListener('click', (event) => {
        if (event.target === errorOverlay) {
            closeErrorBtns[0].click(); 
        }
    });
}

