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

const toolbarOptions = [
    ['bold', 'italic', 'underline'], // Essential text styling
    ['code-block'], ['link'],
    [{ 'script': 'sub' }, { 'script': 'super' }], // Subscript, Superscript
  ];
  
  const editor = new Quill('#editor', {
    theme: 'snow',
    placeholder: "What makes this study note special? Highlight its key insights, unique takeaways, or how it helps others learn better.",
    modules: {
      toolbar: toolbarOptions
    }
  });
  
document.getElementById('editor').style.height = '200px';


const uploadToastData = (svgTitle, message) => {
    return {
        title: svgTitle,
        text: message,
        showConfirmButton: true,
        confirmButtonText: 'OK',
    }
}

const UPLOAD_CONFIRMATION = '<svg width="100px" height="100px" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="20" width="100" height="140" rx="10" stroke="black" stroke-width="4" fill="none"/><line x1="60" y1="40" x2="140" y2="40" stroke="black" stroke-width="4"/><line x1="60" y1="60" x2="140" y2="60" stroke="black" stroke-width="4"/><line x1="60" y1="80" x2="140" y2="80" stroke="black" stroke-width="4"/><line x1="60" y1="100" x2="140" y2="100" stroke="black" stroke-width="4"/><line x1="60" y1="120" x2="140" y2="120" stroke="black" stroke-width="4"/><circle cx="150" cy="150" r="28" stroke="black" stroke-width="4" fill="white"/><path d="M140 150L148 158L162 142" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const IMAGE_SELECT = '<svg width="70px" height="70px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.04 13.55C17.62 13.96 17.38 14.55 17.44 15.18C17.53 16.26 18.52 17.05 19.6 17.05H21.5V18.24C21.5 20.31 19.81 22 17.74 22H7.63C7.94 21.74 8.21 21.42 8.42 21.06C8.79 20.46 9 19.75 9 19C9 16.79 7.21 15 5 15C4.06 15 3.19 15.33 2.5 15.88V11.51C2.5 9.44001 4.19 7.75 6.26 7.75H17.74C19.81 7.75 21.5 9.44001 21.5 11.51V12.95H19.48C18.92 12.95 18.41 13.17 18.04 13.55Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path opacity="0.4" d="M2.5 12.4098V7.83986C2.5 6.64986 3.23 5.58982 4.34 5.16982L12.28 2.16982C13.52 1.69982 14.85 2.61985 14.85 3.94985V7.74983" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.5608 13.9702V16.0302C22.5608 16.5802 22.1208 17.0302 21.5608 17.0502H19.6008C18.5208 17.0502 17.5308 16.2602 17.4408 15.1802C17.3808 14.5502 17.6208 13.9602 18.0408 13.5502C18.4108 13.1702 18.9208 12.9502 19.4808 12.9502H21.5608C22.1208 12.9702 22.5608 13.4202 22.5608 13.9702Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path opacity="0.4" d="M7 12H14" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 19C9 19.75 8.79 20.46 8.42 21.06C8.21 21.42 7.94 21.74 7.63 22C6.93 22.63 6.01 23 5 23C3.54 23 2.27 22.22 1.58 21.06C1.21 20.46 1 19.75 1 19C1 17.74 1.58 16.61 2.5 15.88C3.19 15.33 4.06 15 5 15C7.21 15 9 16.79 9 19Z" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.06922 20.0402L3.94922 17.9302" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.04969 17.96L3.92969 20.0699" stroke="#292D32" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const CANNOT_UPLOAD = '<svg fill="#000000" width="70px" height="70px" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 10c.277 0 .5.223.5.5v3c0 .277-.223.5-.5.5s-.5-.223-.5-.5v-3c0-.277.223-.5.5-.5zm-9 0c.277 0 .5.223.5.5v3c0 .277-.223.5-.5.5s-.5-.223-.5-.5v-3c0-.277.223-.5.5-.5zM15 20c-2.104 0-4.186.756-5.798 2.104-.542.4.148 1.223.638.76C11.268 21.67 13.137 21 15 21s3.732.67 5.16 1.864c.478.45 1.176-.364.638-.76C19.186 20.756 17.104 20 15 20zm0-20C6.722 0 0 6.722 0 15c0 8.278 6.722 15 15 15 8.278 0 15-6.722 15-15 0-8.278-6.722-15-15-15zm0 1c7.738 0 14 6.262 14 14s-6.262 14-14 14S1 22.738 1 15 7.262 1 15 1z" stroke-width="3"/></svg>'
const NO_CONNECTION = '<svg width="70px" height="70px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="m 1.53125 0.46875 l -1.0625 1.0625 l 14 14 l 1.0625 -1.0625 l -6.191406 -6.191406 c 0.546875 0.175781 1.042968 0.46875 1.421875 0.886718 l 0.5 0.542969 c 0.175781 0.199219 0.425781 0.316407 0.691406 0.328125 c 0.265625 0.015625 0.523437 -0.078125 0.722656 -0.257812 c 0.195313 -0.179688 0.3125 -0.429688 0.324219 -0.695313 c 0.011719 -0.261719 -0.082031 -0.523437 -0.261719 -0.71875 l -0.5 -0.546875 c -1.121093 -1.234375 -2.703125 -1.828125 -4.269531 -1.816406 c -0.28125 0.003906 -0.5625 0.027344 -0.839844 0.066406 l -1.671875 -1.671875 c 2.859375 -0.839843 6.183594 -0.222656 8.351563 1.851563 l 0.5 0.476562 c 0.398437 0.378906 1.03125 0.367188 1.414062 -0.03125 c 0.378906 -0.398437 0.367188 -1.03125 -0.03125 -1.410156 l -0.496094 -0.480469 c -1.957031 -1.875 -4.578124 -2.808593 -7.195312 -2.808593 c -1.410156 0 -2.820312 0.273437 -4.125 0.820312 z m -0.230469 3.894531 c -0.167969 0.140625 -0.335937 0.28125 -0.496093 0.4375 l -0.496094 0.480469 c -0.3984378 0.378906 -0.410156 1.011719 -0.03125 1.410156 c 0.382812 0.398438 1.015625 0.410156 1.414062 0.03125 l 0.5 -0.476562 c 0.171875 -0.164063 0.347656 -0.316406 0.535156 -0.460938 z m 2.96875 2.964844 c -0.179687 0.148437 -0.347656 0.3125 -0.507812 0.484375 l -0.5 0.550781 c -0.179688 0.195313 -0.277344 0.453125 -0.261719 0.71875 c 0.011719 0.265625 0.128906 0.515625 0.324219 0.695313 c 0.199219 0.179687 0.457031 0.273437 0.722656 0.257812 c 0.265625 -0.011718 0.515625 -0.128906 0.691406 -0.328125 l 0.5 -0.546875 c 0.136719 -0.148437 0.292969 -0.28125 0.460938 -0.402344 z m 2.867188 2.871094 c -0.199219 0.09375 -0.386719 0.222656 -0.550781 0.386719 c -0.78125 0.78125 -0.78125 2.046874 0 2.828124 s 2.046874 0.78125 2.828124 0 c 0.164063 -0.164062 0.292969 -0.351562 0.386719 -0.550781 z m 0 0" fill="#2e3436"/></svg>'
const FILLUP_ALL = '<svg fill="#000000" width="70px" height="70px" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M21,12H7a1,1,0,0,1-1-1V7A1,1,0,0,1,7,6H21a1,1,0,0,1,1,1v4A1,1,0,0,1,21,12ZM8,10H20V7.94H8Z" class="clr-i-outline clr-i-outline-path-1"></path><path d="M21,14.08H7a1,1,0,0,0-1,1V19a1,1,0,0,0,1,1H18.36L22,16.3V15.08A1,1,0,0,0,21,14.08ZM20,18H8V16H20Z" class="clr-i-outline clr-i-outline-path-2"></path><path d="M11.06,31.51v-.06l.32-1.39H4V4h20V14.25L26,12.36V3a1,1,0,0,0-1-1H3A1,1,0,0,0,2,3V31a1,1,0,0,0,1,1h8A3.44,3.44,0,0,1,11.06,31.51Z" class="clr-i-outline clr-i-outline-path-3"></path><path d="M22,19.17l-.78.79A1,1,0,0,0,22,19.17Z" class="clr-i-outline clr-i-outline-path-4"></path><path d="M6,26.94a1,1,0,0,0,1,1h4.84l.3-1.3.13-.55,0-.05H8V24h6.34l2-2H7a1,1,0,0,0-1,1Z" class="clr-i-outline clr-i-outline-path-5"></path><path d="M33.49,16.67,30.12,13.3a1.61,1.61,0,0,0-2.28,0h0L14.13,27.09,13,31.9a1.61,1.61,0,0,0,1.26,1.9,1.55,1.55,0,0,0,.31,0,1.15,1.15,0,0,0,.37,0l4.85-1.07L33.49,19a1.6,1.6,0,0,0,0-2.27ZM18.77,30.91l-3.66.81L16,28.09,26.28,17.7l2.82,2.82ZM30.23,19.39l-2.82-2.82L29,15l2.84,2.84Z" class="clr-i-outline clr-i-outline-path-6"></path><rect x="0" y="0" width="36" height="36" fill-opacity="0"/></svg>'

async function publish(self) {
    if (self.getAttribute('data-disabled')) return
    function toogleBrowse(showBrowse) {
        document.querySelector('#note-upload-loader').style.display = (showBrowse ? 'none' : 'block')
        document.querySelector('#fileInputBox').style.display = (showBrowse ? 'flex' : 'none')
    }
    
    try {
        if (stackFiles.length >= 2) {
            let noteSubject = document.querySelector('.note-subject').value;
            let noteTitle = document.querySelector('.note-title').value
            const noteDescription = editor.root.innerHTML;
            
            if(noteSubject && noteTitle && editor.root.textContent.trim() !== "") {
                self.setAttribute('data-disabled', true)
                toogleBrowse(false)

                let formData = new FormData();
                stackFiles.forEach((file, index) => {
                    formData.append(`image-${index}`, file);
                });
                formData.append('noteSubject', noteSubject);
                formData.append('noteTitle', noteTitle);
                formData.append('noteDescription', noteDescription);
    
                Swal.fire(uploadToastData(UPLOAD_CONFIRMATION, "Your note is being processed and will be uploaded shortly. We'll notify you as soon as it's ready!"))

                try {
                    let response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    })
                    let data = await response.json()
                    if (data.ok) {
                        stackFiles.length = 0;
                        updateStackStatus();
                    } else {
                        if (data.kind === 404) {
                            Swal.fire(uploadToastData(IMAGE_SELECT, "Please select at least 2 images to upload."))
                        } else {
                            Swal.fire(uploadToastData(CANNOT_UPLOAD, "Couldn't upload! Please try again a bit later."))
                        }

                        self.removeAttribute('data-disabled')
                        toogleBrowse(true)
                    }
                } catch (error) {
                    Swal.fire(uploadToastData(NO_CONNECTION, "Couldn't upload, please check your internet connection."))
                }

                self.removeAttribute('data-disabled')
                toogleBrowse(true)

            } else {
                Swal.fire(uploadToastData(FILLUP_ALL, "Please provide all the information!"))
            }
        }
    } catch (error) {
        setupErrorPopup(error)
    }
}

  