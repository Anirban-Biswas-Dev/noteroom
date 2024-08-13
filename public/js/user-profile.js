const host = 'http://localhost:2000'
const socket = io(host)

socket.emit('connection')

function logout() {
    window.location.href = '/logout'
}

// Get the current badge content
let userBadge = document.querySelector('.top-voice-badge').textContent.trim();

function badgeStyling() {
    const badgeElement = document.querySelector('.top-voice-badge');
    // Arnob: see if the html I add conflict with your ejs variables
    if (userBadge === 'No Badge') {
        badgeElement.innerHTML = '<div class="top-voice-badge no-badge">No Badge</div>';
    } else if (userBadge === 'Chemistry') {
        badgeElement.innerHTML = '<div class="badge-achievement">Chemistry</div>';
    } else if (userBadge === 'Physics') {
        badgeElement.innerHTML = '<div class="badge-achievement">Physics</div>';
    }
    //will add more later
}

badgeStyling();

