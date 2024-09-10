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
    const badgeLogo = document.querySelector('img.badge-logo')
    
    function add_label(subject) {
        badgeElement.innerHTML = `Top ${subject} voice`;
        badgeLogo.src = `\\images\\badges\\${subject.toLowerCase()}.png` 
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
        case "Bangla":
            add_label("Bangla")
            break
        default:
            badgeElement.innerHTML = '<div class="no-badge">No badge</div>';
            break
    }
}

badgeStyling();
