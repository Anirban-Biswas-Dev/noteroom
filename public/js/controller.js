const conHost = window.location.origin
const conSock = io(conHost)

//* Download: Dashboard + Note View
async function download(noteID, noteTitle) { 
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
    document.querySelector('.status').style.display = 'flex'
}
function finish() {
    document.querySelector('.status').style.display = 'none'
}

//* Share Model: Dashboard + Note View
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
    const linkElement = document.querySelector('._link_').innerHTML;

    switch(platform) {
        case "facebook":
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkElement + '/shared')}`, '_blank')
            break
        case "whatsapp":
            let message = `Check out this note on NoteRoom: ${linkElement}`
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank')
            break
    }
}

//* Search Notes: All Pages
async function searchNotes() {
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
        let response = await fetch(`/search?q=${encodeURIComponent(searchTerm)}`)
        let notes = await response.json()
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
                `)
            })
        } else {
            searchedResults.insertAdjacentHTML('afterbegin', `
                <div class='results-card'>
                    <p>We didn't find any note related to your search</p>
                </div>
            `)
        }
    }
}
let searchBtn = document.querySelector('.search-btn')
searchBtn.addEventListener('click', searchNotes)

let searchInput = document.querySelector('.search-bar')
let resultsContainer = document.querySelector('.results-container')

searchInput.addEventListener('focus', function() {
    resultsContainer.style.display = 'flex';
})

searchInput.addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
        searchBtn.click()
    }
})

const manageStorage = {
    add: function(key, object) {
        localStorage.setItem(key, JSON.stringify(object))
    },
    update: function(key, id=undefined, method, object=undefined, type=undefined) {
        if(method === 'insert') {
            let values = JSON.parse(localStorage.getItem(key))
            if((object !== undefined) && (id === undefined)) {
                values.push(object)
                this.add(key, values)
            }
        } else if(method === 'remove') {
            if(object === undefined) {
                let values = JSON.parse(localStorage.getItem(key))
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
        let values = JSON.parse(localStorage.getItem(key))
        let noteData = values.find(item => item.noteID == noteID)
	    return !(noteData == undefined)
    },
    getContentLength: function(key) {
        let values = JSON.parse(localStorage.getItem(key))
	    return values.length
    },
    getContent: function(key) {
        let values = JSON.parse(localStorage.getItem(key))
        return values
    }
}

function deleteNoti(id) {
    conSock.emit('delete-noti', id) 
	document.querySelector(`#noti-${id}`).remove() 
	manageStorage.update('notis', id, 'remove')
}

//* Adding notifications: All pages
function truncatedTitle(title) {
    const titleCharLimit = 30;
    let truncatedTitle =
      title.length > titleCharLimit
        ? title.slice(0, titleCharLimit) + "..."
        : title;
    return truncatedTitle
}

let notificationCount = 0;
function addNoti(feedbackData) {
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

    notificationCount++;
    updateNotificationBadge();
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

conSock.on('feedback-given' , (feedbackData) => {
	if (feedbackData.ownerUsername == Cookies.get('recordName')) {
		feedbackData.isNoti = true //* Identifing a notification object
		manageStorage.update('notis', undefined, 'insert', feedbackData) // Adding notification data in the localStorage (BUG-1)
		addNoti(feedbackData)

		const nftShake = document.querySelector('.mobile-nft-btn')
		nftShake.classList.add('shake')
		setTimeout(() => {
			nftShake.classList.remove('shake');
		}, 300)
	}
})


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