const host = window.location.origin
const socket = io(host)

let baseURL = 'https://storage.googleapis.com/noteroom-fb1a7.appspot.com/badges/'
let imageObject = {
    'No Badge': `${baseURL}no-badge.png`,
    'Biology': `${baseURL}biology.png`,
    'English': `${baseURL}english.png`
}

socket.emit('connection')

function logout() {
    window.location.href = '/logout'
}

function badgeStyling() {
    let userBadge = document.querySelector('.top-voice-badge').textContent.trim();
    const badgeElement = document.querySelector('.top-voice-badge');
    const badgeLogo = document.querySelector('img.badge-logo')
    
    function add_label(subject) {
        if (!(subject == undefined)) {
            badgeElement.innerHTML = `Top ${subject} voice`;
            badgeLogo.src = imageObject[subject]
        } else {
            badgeLogo.src = `https://storage.googleapis.com/noteroom-fb1a7.appspot.com/badges/no-badge.png` 
        }
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
            add_label()
            break
    }
}

badgeStyling();

// ********** Nav Bar for User Notes And Saved Notes *********
const userNotes = document.querySelector('.notes-container');
const userSavedNotes = document.querySelector('.sv-notes-container');
const userNotesBtn = document.querySelector('.user-notes');
const userSavedNotesBtn = document.querySelector('.student-saved-notes');

const toggleSections = (activeBtn, inactiveBtn, showSection, hideSection) => {
    activeBtn.classList.add('active-section');
    inactiveBtn.classList.remove('active-section');
    showSection.classList.add('visible-container');
    showSection.classList.remove('not-show');
    hideSection.classList.add('not-show');
    hideSection.classList.remove('visible-container');
};

userSavedNotesBtn.addEventListener('click', () => {
    toggleSections(userSavedNotesBtn, userNotesBtn, userSavedNotes, userNotes);
});

userNotesBtn.addEventListener('click', () => {
    toggleSections(userNotesBtn, userSavedNotesBtn, userNotes, userSavedNotes);
});

