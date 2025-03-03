const host = window.location.origin;
const socket = io(host);

// College name mapping logic
const collegeID = document.querySelector('.user-clg')?.getAttribute('data-collegeid');
const collegeName = document.querySelector('#college-name');
if (collegeID && collegeName) {
    try {
        const collegeData = getCollegeFromID(collegeID);
        if (collegeData && collegeData.name) {
            collegeName.innerHTML = collegeData.name;
        } else {
            console.error('College data not found for ID:', collegeID);
            collegeName.innerHTML = 'Unknown College'; // Fallback
        }
    } catch (error) {
        console.error('Error fetching college name:', error);
        collegeName.innerHTML = 'Unknown College'; // Fallback on error
    }
} else {
    console.error('College ID or name element not found in DOM');
}

// Notes loading logic with improved error handling
const observer = new IntersectionObserver(
    entries => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                console.log('IntersectionObserver triggered for #ownedNotes'); // Debug log
                const username = document.querySelector('#ownedNotes')?.getAttribute('data-username');
                const selfUserName = Cookies.get('username');

                if (!username) {
                    console.error('Username not found for #ownedNotes element');
                    return;
                }

                try {
                    if (selfUserName && selfUserName === username) {
                        console.log('Loading owned notes from manageDb'); // Debug log
                        const notes = await manageDb.get('ownedNotes');
                        if (notes && notes.length > 0) {
                            notes.forEach(note => {
                                try {
                                    manageNotes.addNoteProfile(note, 'owned', true);
                                } catch (error) {
                                    console.error('Error adding note to profile:', error, note);
                                }
                            });
                        } else {
                            console.log('No owned notes found in manageDb');
                            document.querySelector('#no-notes-owned').style.display = 'flex';
                        }
                    } else {
                        console.log('Fetching notes from API for username:', username); // Debug log
                        const response = await fetch(`/api/note?noteType=owned&username=${username}`);
                        if (!response.ok) {
                            throw new Error(`API fetch failed: ${response.status} ${response.statusText}`);
                        }
                        const data = await response.json();
                        console.log('API response:', data); // Debug log
                        if (data.objects && data.objects.length !== 0) {
                            data.objects.forEach(note => {
                                try {
                                    manageNotes.addNoteProfile(
                                        { 
                                            noteID: note._id, 
                                            noteTitle: note.title, 
                                            noteThumbnail: note.thumbnail, 
                                            ownerDisplayName: note.ownerDocID.displayname,
                                            ownerUserName: note.ownerDocID.username 
                                        },
                                        'owned',
                                        false
                                    );
                                } catch (error) {
                                    console.error('Error adding note to profile:', error, note);
                                }
                            });
                        } else {
                            console.log('No notes found in API response');
                            document.querySelector('#no-notes-owned').style.display = 'flex';
                        }
                    }
                } catch (error) {
                    console.error('Error loading notes:', error);
                    document.querySelector('#no-notes-owned').style.display = 'flex';
                } finally {
                    const loadingElement = document.querySelector('.notes-loading');
                    if (loadingElement) {
                        loadingElement.remove();
                    } else {
                        console.error('Notes loading element not found');
                    }
                    observer.unobserve(entry.target);
                }
            }
        });
    },
    {
        rootMargin: '0px 0px 0px 0px'
    }
);

window.addEventListener('load', () => {
    const target = document.querySelector('#ownedNotes');
    if (target) {
        console.log('Observing #ownedNotes for notes loading');
        observer.observe(target);
    } else {
        console.error("Element with ID 'ownedNotes' not found.");
    }
});

// The delete note event handler
const deleteNoteToastData = (type, message, timer = 2000) => {
    return {
        toast: true,
        position: "bottom-end",
        icon: type,
        title: message,
        timer: timer,
        timerProgressBar: true,
        showConfirmButton: false
    };
};

function deleteNote(container) {
    const noteTitle = container.getAttribute('data-notetitle');
    Swal.fire({
        icon: 'warning',
        title: `Are you sure you want to delete the note "<b>${noteTitle}</b>"?`,
        text: 'This action cannot be undone',
        confirmButtonText: 'Proceed',
        showConfirmButton: true,
        showCancelButton: true
    }).then(result => {
        if (result.isConfirmed) {
            Swal.fire(deleteNoteToastData('success', 'Note will be deleted soon.'));
            const noteDocID = container.getAttribute('data-id');
            const noteElement = document.querySelector(`#own-note-${noteDocID}`);
            if (noteElement) {
                noteElement.remove();
            }

            fetch(`/api/note/delete/${noteDocID}`, {
                method: 'delete'
            })
                .then(response => response.json())
                .then(async data => {
                    if (data.deleted) {
                        await manageDb.delete('ownedNotes', { idPath: 'noteID', id: noteDocID });
                    } else {
                        Swal.fire(deleteNoteToastData('error', 'Cannot delete the note right now!', 3000));
                    }
                })
                .catch((error) => {
                    Swal.fire(deleteNoteToastData('error', 'Cannot delete the note right now!', 3000));
                });
        }
    });
}

// Nav Bar for User Notes and Saved Notes
const userNotes = document.querySelector('.notes-container');
const userSavedNotes = document.querySelector('.sv-notes-container');
const userNotesBtn = document.querySelector('#ownedNotes');
const userSavedNotesBtn = document.querySelector('#savedNotes');

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
        let savedNotes = await manageDb.get('savedNotes');
        if (savedNotes.length !== 0) {
            savedNotes.forEach(note => {
                manageNotes.addNoteProfile(note, 'saved');
            });
        } else {
            document.querySelector('#no-notes-saved').style.display = 'flex';
        }
        toggleSections(userSavedNotesBtn, userNotesBtn, userSavedNotes, userNotes);
    });

    userNotesBtn.addEventListener('click', () => {
        toggleSections(userNotesBtn, userSavedNotesBtn, userNotes, userSavedNotes);
    });
} catch (error) {
    console.error("Error in toggling notes sections:", error);
}

document.querySelector(".share-user-profile").addEventListener("click", function() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        Swal.fire({
            toast: true,
            icon: "success",
            position: "bottom-end",
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
            title: `Change your <b>${fieldName}</b>`,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Proceed',
            cancelButtonText: 'Cancel',
            input: type,
            customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
                input: 'custom-swal-input'
            }
        };
    };

    const tostDataChangeProfile = (icon, message) => {
        return {
            icon: icon,
            toast: true,
            position: 'bottom-end',
            title: message,
            timerProgressBar: true,
            showConfirmButton: false,
            timer: 4000,
        };
    };

    async function changeDetails({ field, fieldName, newValue }) {
        let userData = new FormData();
        userData.append('fieldName', fieldName);
        userData.append('newValue', newValue);

        let response = await fetch('/api/user/profile/change', {
            method: 'post',
            body: userData
        });
        let data = await response.json();
        if (!data.ok) {
            Swal.fire(tostDataChangeProfile('warning', `Couldn't change your <b>${field}</b>! Try again a bit later.`));
        }
    }

    let fieldName = event.getAttribute('data-field');
    let field = event.getAttribute('data-name');

    if (field === 'profile_pic') {
        let result = await Swal.fire(changeDetailsWindow(fieldName, "file"));
        if (result.isConfirmed) {
            let value = result.value;
            if (value) {
                let picUrl = URL.createObjectURL(value);
                let picSelected = await Swal.fire({
                    title: "Your uploaded picture",
                    imageUrl: picUrl,
                    imageAlt: "The uploaded picture",
                    customClass: {
                        popup: 'custom-swal-popup',
                        title: 'custom-swal-title',
                        image: 'user-prfl-pic',
                        confirmButton: 'custom-swal-confirm-button',
                        cancelButton: 'custom-swal-cancel-button'
                    },
                    showConfirmButton: true,
                    showCancelButton: true,
                    confirmButtonText: 'Change',
                    cancelButtonText: 'Cancel'
                });  
                if (picSelected.isConfirmed) {
                    Swal.fire(tostDataChangeProfile('success', `Your <b>${fieldName}</b> will change soon! It may take some time to take effect.`));
                    await changeDetails({ field: fieldName, fieldName: field, newValue: value });
                }   
                URL.revokeObjectURL(picUrl);              
            }
        }
    } else if (field === 'favouritesubject' || field === 'notfavsubject') {
        let group = document.querySelector('.user-group')?.textContent?.toLowerCase() || 'science';
        let subjects = subjectsData[group]?.map(data => data.name)?.concat(subjectsData["general"]?.map(data => data.name)) || [];
        let subjectObjects = {};
        subjects.forEach(subject => {
            subjectObjects[subject] = subject;
        });
        
        let result = await Swal.fire({
            title: `Change your <b>${fieldName}</b>`,
            input: "select",
            inputOptions: {
                Subject: subjectObjects
            },
            inputPlaceholder: "Select a subject",
            showCancelButton: true,
            confirmButtonText: 'Change',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'custom-swal-popup',
                title: 'custom-swal-title',
                confirmButton: 'custom-swal-confirm-button',
                cancelButton: 'custom-swal-cancel-button',
                input: 'custom-swal-input'
            }
        });
        if (result.isConfirmed) {
            let value = result.value;
            if (value) {
                Swal.fire(tostDataChangeProfile('success', `Your <b>${fieldName}</b> will change soon! It may take some time to take effect.`));
                await changeDetails({ field: fieldName, fieldName: field, newValue: value });    
            }
        }
    } else {
        let result = await Swal.fire(changeDetailsWindow(fieldName, "text"));
        if (result.isConfirmed) {
            let value = result.value;
            Swal.fire(tostDataChangeProfile('success', `Your <b>${fieldName}</b> will change soon! It may take some time to take effect.`));
            await changeDetails({ field: fieldName, fieldName: field, newValue: value });
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

// Initialize Tippy.js for badge tooltips
document.addEventListener('DOMContentLoaded', () => {
    tippy('[data-tippy-content]', { trigger: 'mouseenter click' });
});