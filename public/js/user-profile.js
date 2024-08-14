const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('connection')

function logout() {
    window.location.href = '/logout'
}

function badgeStyling() {
    // Get the current badge content
    let userBadge = document.querySelector('.top-voice-badge').textContent.trim();
    const badgeElement = document.querySelector('.top-voice-badge');
    
    function add_label(subject) {
        badgeElement.innerHTML = `<div class="top-voice-badge no-badge">Top ${subject} voice</div>`;
    }
    switch(userBadge) {
        case "Chemistry":
            add_label("Chemistry")
            break
        case "Physics":
            add_label("Physics")
            break
        case "Mathematics":
            add_label("Mathematics")
            break
        case "Biology":
            add_label("Biology")
            break
        case "ICT":
            add_label("ICT")
            break
        case "Bangla":
            add_label("Bangla")
            break
        default:
            badgeElement.innerHTML = '<div class="top-voice-badge no-badge">No badge</div>';
            break
    }
}

function featuredNotesStyling() {
    const featuredNotesCount = document.querySelector('span.featured-count').textContent.trim() // This will grab the featured notes count from the front-end
    if(featuredNotesCount == '0') {
        const featuedNotes = document.querySelector('div.featured-note')
        featuedNotes.innerHTML = 'No notes to be fetaured' // If there is no featured notes, this message will be shown in that specific div
        featuedNotes.style.border = '2px solid black' // Like this an example of styling dynamically. The border will be black if there are no featured notes. Develop as you want
    } else {
        const featuedNotes = document.querySelector('div.featured-note')
        featuedNotes.innerHTML = `Featured notes count: ${featuredNotesCount}` // If there is 1+ featured notes, the ammount will be shown
        featuedNotes.style.border = '2px solid blue' // Like this an example of styling dynamically. Th border will be blue if there are 1+ featured notes
    }
}

badgeStyling();
featuredNotesStyling()