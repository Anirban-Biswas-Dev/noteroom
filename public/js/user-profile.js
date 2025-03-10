
const host = window.location.origin
const socket = io(host)

let collegeID = document.querySelector('.user-clg').getAttribute('data-collegeid')
let collegeName = document.querySelector('#college-name')
let collegeLogo = document.querySelector('.user-clg--img')

let collegeData = getCollegeFromID(collegeID)
collegeName.innerHTML = collegeData.name
collegeLogo.src = `\\images\\onboarding-assets\\College-logos\\${collegeData.logo}`


let observer = new IntersectionObserver(entries => {
    entries.forEach(async entry => {
        if (entry.isIntersecting) {
            let username = document.querySelector('#ownedNotes').getAttribute('data-username')
            let selfUserName = Cookies.get('username')

            if (selfUserName && selfUserName === username) {
                let notes = await manageDb.get('ownedNotes')
                notes.forEach(note => {
                    manageNotes.addNoteProfile(note, 'owned', true)
                })
            } else {
                let response = await fetch(`/api/note?noteType=owned&username=${username}`)
                let data = await response.json()
                console.log(data.objects)
                if (data.objects.length !== 0) {
                    data.objects.forEach(note => {
                        manageNotes.addNoteProfile({ 
                            noteID: note._id, 
                            noteTitle: note.title, 
                            noteThumbnail: note.thumbnail, 
                            ownerDisplayName: note.ownerDocID.displayname,
                            ownerUserName: note.ownerDocID.username 
                        }, 'owned', false)
                    })
                } else {
                    document.querySelector('#no-notes-owned').style.display = 'flex'
                }
            }
            observer.unobserve(entry.target)
            document.querySelector('.owned-notes-status').remove()
        }
    })
}, {
    rootMargin: '0px 0px -300px 0px'
})
window.addEventListener('load', () => {
    observer.observe(document.querySelector('#ownedNotes'))
})

//* The delete note eventhandler
const deleteNoteToastData = (type, message, timer = 2000) => {
    return {
        toast: true,
        position: "bottom-end",
        icon: type,
        title: message,
        timer: timer,
        timerProgressBar: true,
        showConfirmButton: false
    }
}

function deleteNote(container) {
    let noteTitle = container.getAttribute('data-notetitle')
    Swal.fire({
        icon: 'warning',
        title: `Are you sure you want to delete the note "<b>${noteTitle}</b>"?`,
        text: 'This action cannot be undone',
        confirmButtonText: 'Proceed',
        showConfirmButton: true,
        showCancelButton: true
    }).then(result => {
        if (result.isConfirmed) {
            Swal.fire(deleteNoteToastData('success', 'Note will be deleted soon.'))
            let noteDocID = container.getAttribute('data-id')
            document.querySelector(`#own-note-${noteDocID}`).remove()

            fetch(`/api/note/delete/${noteDocID}`, {
                method: 'delete'
            })
                .then(response => response.json())
                .then(async data => {
                    if (data.deleted) {
                        await manageDb.delete('ownedNotes', { idPath: 'noteID', id: noteDocID })
                    } else {
                        Swal.fire(deleteNoteToastData('error', 'Cannot delete the note right now!', 3000))
                    }
                })
                .catch((error) => {
                    Swal.fire(deleteNoteToastData('error', 'Cannot delete the note right now!', 3000))
                })
        }
    })
}



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


document.querySelector(".share-user-profile").addEventListener("click", function() {
    // Copy current page URL
    navigator.clipboard.writeText(window.location.href).then(() => {
        // Show success toast
        Swal.fire({
            toast: true,
            icon: "success",
            position:"bottom-end",
            title: "Profile link copied!",
            showConfirmButton: false,
            timer: 2000
        });
    }).catch(err => {
        console.error("Failed to copy: ", err);
    });
});



async function changeDetail(event) {
    const changeDetailsWindow = (fieldName, type) => {
        return {
            icon: 'success',
            title: `Change your <b>${fieldName}</b>`,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Proceed',
            input: type,
        }
    }

    const tostDataChangeProfile = (icon, message) => {
        return {
            icon: icon,
            toast: true,
            position: 'bottom-end',
            title: message,
            timerProgressBar: true,
            showConfirmButton: false,
            timer: 4000,
        }
    }

    async function changeDetails({ field, fieldName, newValue }) {
        let userData = new FormData()
        userData.append('fieldName', fieldName)
        userData.append('newValue', newValue)

        let response = await fetch('/api/user/profile/change', {
            method: 'post',
            body: userData
        })
        let data = await response.json()
        if (!data.ok) {
            Swal.fire(tostDataChangeProfile('warning', `Couldn't change your <b>${field}</b>! Try again a bit later.`))
        }
    }
    let fieldName = event.getAttribute('data-field')
    let field = event.getAttribute('data-name')

    if (field === 'profile_pic') {
        let result = await Swal.fire(changeDetailsWindow(fieldName, "file"))
        if (result.isConfirmed) {
            let value = result.value
            if (value) {
                let picUrl = URL.createObjectURL(value)
                let picSelected = await Swal.fire({
                    title: "Your uploaded picture",
                    imageUrl: picUrl,
                    imageAlt: "The uploaded picture",
                    customClass: {
                        image: 'user-prfl-pic'
                    },
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Change'
                })  
                if (picSelected.isConfirmed) {
                    Swal.fire(tostDataChangeProfile('success', `Your <b>${fieldName}</b> will change soon! It may take some time to take effect.`))
                    // /* @anirban the profile_pic file input */
                    await changeDetails({ field: fieldName, fieldName: field, newValue: value })
                }   
                URL.revokeObjectURL(picUrl)              
            }
        }
    } else if (field === 'favouritesubject' || field === 'notfavsubject') {
        let group = document.querySelector('.user-group').textContent.toLowerCase()
        let subjects = subjectsData[group].map(data => data.name).concat(subjectsData["general"].map(data => data.name))
        let subjectObjects = {}
        subjects.forEach(subject => {
            subjectObjects[subject] = subject
        })
        
        let result = await Swal.fire({
            title: `Change your <b>${fieldName}</b>`,
            input: "select",
            inputOptions: {
                Subject: subjectObjects
            },
            inputPlaceholder: "Select a subject",
            showCancelButton: true,
            confirmButtonText: 'Change'
        })
        if (result.isConfirmed) {
            let value = result.value
            if (value) {
                Swal.fire(tostDataChangeProfile('success', `Your <b>${fieldName}</b> will change soon! It may take some time to take effect.`))
                await changeDetails({ field: fieldName, fieldName: field, newValue: value })    
            }
        }

    } else {
        let result = await Swal.fire(changeDetailsWindow(fieldName, "text"))
        if (result.isConfirmed) {
            let value = result.value
            Swal.fire(tostDataChangeProfile('success', `Your <b>${fieldName}</b> will change soon! It may take some time to take effect.`))
            await changeDetails({ field: fieldName, fieldName: field, newValue: value })
        }
    }
}

function showProfilePreview(imageUrl) {
    Swal.fire({
        html: `<img src="${imageUrl}" class="swal-profile-pic-preview" alt="Profile Picture" style="width: 100%; border-radius: 50%;">`,
        showCloseButton: true,
        showConfirmButton: false,
        background: 'transparent',
        customClass: {
            popup: 'profile-preview-popup'
        }
    });
}
f