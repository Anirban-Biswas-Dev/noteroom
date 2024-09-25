async function download(noteTitle, links) {
    start() // start of animation

    try {
        let noteDetailes = new FormData()
        noteDetailes.append('noteTitle', noteTitle)
        noteDetailes.append('links', links)
    
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

function setupShareModal() {
    const shareNoteModal = document.querySelector('.share-note-overlay');
    const closeNoteModalBtn = document.querySelector('.close-share-note-modal');
    const linkElement = document.querySelector('._link_');

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
