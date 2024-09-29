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

// Share Note Modal

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
            document.querySelector('.status').style.display = 'none'
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
                <div class="results-card">
                    <p class="result-note-title">We didn't find any note related to your search</p>
                    <i class="fa-solid fa-arrow-up"></i>
                </div>
            `)
        }
    }
}

let searchBtn = document.querySelector('.search-btn')
searchBtn.addEventListener('click', searchNotes)


let searchInput = document.querySelector('.search-bar')
let resultsContainer = document.querySelector('.results-container')

// Press enter and the search will happen
searchInput.addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
        searchBtn.click()
    }
})

// Design this Arnob
searchInput.addEventListener('focus', function() {
    resultsContainer.style.display = 'flex'
})
