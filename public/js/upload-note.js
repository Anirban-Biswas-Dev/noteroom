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
        const deleteBtn = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        deleteBtn.setAttribute("width", "24");
        deleteBtn.setAttribute("height", "24");
        deleteBtn.setAttribute("viewBox", "0 0 24 24");
        deleteBtn.setAttribute("class", "delete-btn"); // Add a class for styling
        
        // Create path inside the SVG
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M 10 2 L 9 3 L 4 3 L 4 5 L 5 5 L 5 20 C 5 20.522222 5.1913289 21.05461 5.5683594 21.431641 C 5.9453899 21.808671 6.4777778 22 7 22 L 17 22 C 17.522222 22 18.05461 21.808671 18.431641 21.431641 C 18.808671 21.05461 19 20.522222 19 20 L 19 5 L 20 5 L 20 3 L 15 3 L 14 2 L 10 2 z M 7 5 L 17 5 L 17 20 L 7 20 L 7 5 z M 9 7 L 9 18 L 11 18 L 11 7 L 9 7 z M 13 7 L 13 18 L 15 18 L 15 7 L 13 7 z");
        
        // Append path to SVG
        deleteBtn.appendChild(path);
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
    ['code-block'],
    [{ 'script': 'sub' }, { 'script': 'super' }], // Subscript, Superscript
    ['formula'], // Math formulas
  ];
  
  const editor = new Quill('#editor', {
    theme: 'snow',
    placeholder: "What makes this study note special? Highlight its key insights, unique takeaways, or how it helps others learn better.",
    modules: {
      toolbar: toolbarOptions
    }
  });
  
document.getElementById('editor').style.height = '200px';


const uploadToastData = (message, type) => {
    return {
        toast: true,
        position: "bottom-end",
        icon: type,
        title: message,
        showConfirmButton: true
    }
}


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
    
                Swal.fire(uploadToastData(Messages.upload_section.onUploadUserConformation, 'success'))

                let response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                })
                let data = await response.json()
                if (data.ok) {
                    stackFiles.length = 0;
                    updateStackStatus();
                } else {
                    if (data.message) {
                        setupErrorPopup(data.message)
                    } else {
                        Swal.fire(uploadToastData(Messages.upload_section.onErrorConfirmation, 'error'))   
                    }
                }

                self.removeAttribute('data-disabled')

                toogleBrowse(true)
            } else {
                setupErrorPopup('Please fill up all the available fields to upload.')
            }
        }
    } catch (error) {
        setupErrorPopup(error)
    }
}

  