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
function setupShareModal() {
    const shareNoteModal = document.querySelector('.share-note-overlay');
    const closeNoteModalBtn = document.querySelector('.close-share-note-modal');

    if (!shareNoteModal || !closeNoteModalBtn || !linkElement) {
        console.error('One or more required elements are not found');
        return;
    }

    // Open the modal and populate the link (immediate execution)
    shareNoteModal.style.display = 'flex'; 
    linkElement.innerHTML = `${window.location.origin}${window.location.pathname}`;
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

    navigator.clipboard.writeText(linkElement.textContent)
        .then(() => {
            alert('Link copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}

function share(platform) {
    function sharePage(baseContent) {
        window.open(baseContent, '_blank')
    }

    switch(platform) {
        case "facebook":
            sharePage(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkElement.innerHTML)}`)
            break
        case "whatsapp":
            let message = `Check out this note: ${document.querySelector('h2.section-title').innerHTML} - ${linkElement.innerHTML}`
            sharePage(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`)
            break
    }
}