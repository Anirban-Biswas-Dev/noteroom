const host = window.location.origin
const socket = io(host)

document.addEventListener('DOMContentLoaded', () => {
    let thumbnailPopup = document.querySelector('.thumbnail-pop-up');

    window.addEventListener('click', function (e) {
        if (e.target === thumbnailPopup) {
            thumbnailPopup.style.display = 'none';
        }
    });
});


let stackFiles = []; // Stores all uploaded File objects
let stackImgNum = 0;
const stackNumBox = document.querySelector('.stack-number-container');
const uploadSuccessful = document.querySelector('.success-upload-msg');
const thumbnailPopup = document.querySelector('.thumbnail-pop-up'); 
const thumbnailContainer = document.querySelector('.thumbnail-container'); 
const bgOverlay = document.querySelector('.overlay');
const noNotesMsg = document.querySelector('.no-notes'); // "No Images" message element

// Event listener for file input change (supports multi-file upload)
document.querySelector('input#fileInput').addEventListener('change', function (event) {
    const fileList = Array.from(event.target.files); // Convert FileList to an array

    // Loop through each selected file and add to stackFiles array
    fileList.forEach(file => {
        stackFiles.push(file); // Add each file to stackFiles
    });

    updateStackStatus(); // Update stack status message
    showUploadEffect(); // Show success upload effect
    this.value = ''; // Clear the file input for the next upload
});

// Event listener for the stack-status button to open the thumbnail popup
document.querySelector('.stack-status').addEventListener('click', function () {
    updateStackDisplay(); // Update the thumbnail popup display with stacked images
    thumbnailPopup.style.display = 'flex'; // Show the thumbnail popup
    bgOverlay.style.display = 'flex'; // Show background overlay
});

// Event listener for the discard button to close the popup
document.querySelector('.discard-btn').addEventListener('click', function () {
    thumbnailPopup.style.display = 'none';
    bgOverlay.style.display = 'none';
});

// Function to update the thumbnail container display with stacked images
function updateStackDisplay() {
    thumbnailContainer.innerHTML = ''; // Clear previous images

    // Show "No Images" message if no files are stacked, else hide it
    if (stackFiles.length === 0) {
        noNotesMsg.style.display = 'flex';
    } else {
        noNotesMsg.style.display = 'none';
    }

    // Loop through each file in stackFiles and create a card for each
    stackFiles.forEach((file, index) => {
        const blobUrl = URL.createObjectURL(file); // Create temporary URL

        // Create a new card div and image element
        const card = document.createElement('div');
        card.classList.add('thumbnail-card');

        const img = document.createElement('img');
        img.classList.add('noteImage');
        img.src = blobUrl;
        img.alt = `Note Image ${index + 1}`;

        // Create delete icon and set up click event for deletion
        const deleteBtn = document.createElement('i');
        deleteBtn.classList.add('fa-solid', 'fa-trash', 'delete-btn');
        deleteBtn.onclick = function () {
            stackFiles.splice(index, 1); // Remove the file from the array
            updateStackDisplay(); // Re-render gallery
            updateStackStatus(); // Update stack status
        };

        // Append image and delete button to card, and card to container
        card.appendChild(img);
        card.appendChild(deleteBtn);
        thumbnailContainer.appendChild(card);

        // Revoke the blob URL after the image has loaded to free memory
        img.onload = function () {
            URL.revokeObjectURL(blobUrl);
        };
    });
}

// Function to update the stack status message
function updateStackStatus() {
    stackImgNum = stackFiles.length;

    let message;
    if (stackImgNum === 0) {
        message = 'No Images';
        noNotesMsg.style.display = 'flex';
    } else if (stackImgNum === 1) {
        message = '1 Image';
        noNotesMsg.style.display = 'none';
    } else {
        message = `${stackImgNum} Images`;
        noNotesMsg.style.display = 'none';
    }
    document.querySelector('.stack-number').textContent = message;

    // Update the stack number box color based on the stack size
    if (stackImgNum >= 1 && stackImgNum <= 5) {
        stackNumBox.style.backgroundColor = '#DEEDFF';
        stackNumBox.style.borderColor = '#2D61D8';
    } else if (stackImgNum >= 6) {
        stackNumBox.style.backgroundColor = '#F2F8F0';
        stackNumBox.style.borderColor = '#529F3D';
    }
}

// Function to show the upload success effect
function showUploadEffect() {
    uploadSuccessful.style.display = 'flex';

    requestAnimationFrame(() => {
        uploadSuccessful.classList.add('s-u-effect');
    });

    setTimeout(() => {
        uploadSuccessful.classList.remove('s-u-effect');

        setTimeout(() => {
            uploadSuccessful.style.display = 'none';
        }, 400);
    }, 2000);
}

// Function to show loader
function showLoader() {
    document.querySelector('.loader-overlay').style.display = 'flex'; // Assuming you have a loader element in your HTML
}

// Function to hide loader
function hideLoader() {
    document.querySelector('.loader-overlay').style.display = 'none';
}

const editor = new Quill('#editor', {
    theme: 'snow',
    placeholder: "Describe your note in detail so others can know it's unique", 
});
document.getElementById('editor').style.height = '120px';


const uploadToastData = (message, type) => {
    return {
        toast: true,
        position: "bottom-end",
        icon: type,
        title: message,
        showConfirmButton: true
    }
}


async function publish() {
    function toogleBrowse(showBrowse) {
        document.querySelector('#note-upload-loader').style.display = (showBrowse ? 'none' : 'block')
        document.querySelector('#fileInputBox').style.display = (showBrowse ? 'flex' : 'none')
    }
    
    try {
        if (stackFiles.length != 0) {
            let noteSubject = document.querySelector('.note-subject').value;
            let noteTitle = document.querySelector('.note-title').value
            const noteDescription = editor.root.innerHTML;
            
            if(noteSubject && noteTitle && editor.root.textContent.trim() !== "") {
                toogleBrowse(false)

                let formData = new FormData();
                stackFiles.forEach((file, index) => {
                    formData.append(`image-${index}`, file);
                });
                formData.append('noteSubject', noteSubject);
                formData.append('noteTitle', noteTitle);
                formData.append('noteDescription', noteDescription);
    
                let response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                })
                let data = await response.json()
                if (data.ok) {
                    Swal.fire(uploadToastData(Messages.upload_section.onUploadUserConformation, 'success'))
                } else {
                    if (data.message) {
                        setupErrorPopup(data.message)
                    } else {
                        Swal.fire(uploadToastData(Messages.upload_section.onErrorConfirmation, 'error'))   
                    }
                }

                toogleBrowse(true)
            } else {
                setupErrorPopup('Please fill up all the available fields to upload.')
            }
        }
    } catch (error) {
        setupErrorPopup(error)
    }
}

  