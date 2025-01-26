const host = window.location.origin
const socket = io(host)

socket.emit('connection')

function badgeStyling() {
    let userBadge = document.querySelector('.top-voice-badge').textContent.trim();
    const badgeElement = document.querySelector('.top-voice-badge');
    const badgeLogo = document.querySelector('img.badge-logo')

    function add_label(subject) {
        if (!(subject == undefined)) {
            badgeElement.innerHTML = `Top ${subject} voice`;
            badgeLogo.src = imageObject[subject]
        } else {
            badgeLogo.src = imageObject['No Badge']
        }
    }

    switch (userBadge) {
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


let collegeID = document.querySelector('.user-clg').getAttribute('data-collegeid')
let collegeName = document.querySelector('#college-name')
let collegeLogo = document.querySelector('.user-clg--img')

try {
    if (!Number.isNaN(parseInt(collegeID))) {
        let collegeDistrict = Object.keys(districtCollegeData)[parseInt(collegeID / 100) - 1]
        let collegeObject = districtCollegeData[collegeDistrict].filter(data => data.id == parseInt(collegeID))[0]
    
        collegeName.innerHTML = collegeObject.name
        collegeLogo.src = `\\images\\onboarding-assets\\College-logos\\${collegeObject.logo}`
    } else {
        collegeName.innerHTML = collegeID    
    }
} catch (error) {
    
}


let observer = new IntersectionObserver(entries => {
    entries.forEach(async entry => {
        if (entry.isIntersecting) {
            let username = document.querySelector('#ownedNotes').getAttribute('data-username')
            console.log(username)
            let response = await fetch(`/api/note?noteType=owned&username=${username}`)
            let notes = await response.json()
            if (notes.length !== 0) {
                notes.forEach(note => {
                    manageNotes.addNoteProfile({ noteID: note._id, noteTitle: note.title, noteThumbnail: note.thumbnail }, 'owned')
                })
            } else {
                document.querySelector('#no-notes-owned').style.display = 'flex'
            }
            observer.unobserve(entry.target)
            document.querySelector('.owned-notes-status').remove()
        }
    })
}, {
    rootMargin: '0px 0px -300px 0px'
})
observer.observe(document.querySelector('#ownedNotes'))

//* The delete note eventhandler
// document.addEventListener('click', function (event) {
//     if (event.target.classList.contains('delete-note')) {
//         let noteDocID = event.target.getAttribute('data-id')
//         fetch(`/api/note/delete/${noteDocID}`, {
//             method: 'delete'
//         })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.deleted) {
//                     console.log(`Note deleted`)
//                     document.querySelector(`#owned-note-${noteDocID}`).remove()
//                 }
//                 else console.log(`Something went wrong!`)
//             })
//     }
// })


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

try {
    userSavedNotesBtn.addEventListener('click', async () => {
        let savedNotes = await manageDb.get('savedNotes')
        if (savedNotes.length !== 0) {
            savedNotes.forEach(note => {
                manageNotes.addNoteProfile(note, 'saved')
            })
        } else {
            document.querySelector('#no-notes-saved').style.display = 'flex'
        }
        toggleSections(userSavedNotesBtn, userNotesBtn, userSavedNotes, userNotes);
    });

    userNotesBtn.addEventListener('click', () => {
        toggleSections(userNotesBtn, userSavedNotesBtn, userNotes, userSavedNotes);
    });
} catch (error) {
}

