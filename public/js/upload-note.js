const host = window.location.origin
const socket = io(host)

socket.on('note-validation', (message) => {
    let { errorField } = message
    setTimeout(() => {
        switch(errorField) {
            case 'title':
                let titleElement = document.querySelector('.note-title')
                titleElement.style.border = '2px solid red'
                setupErrorPopup("Title's character must be less than 200.")
                break
        }

        hideLoader()
    }, 1000)
})


document.addEventListener('DOMContentLoaded', () => {
    let thumbnailPopup = document.querySelector('.thumbnail-pop-up');

    window.addEventListener('click', function (e) {
        if (e.target === thumbnailPopup) {
            thumbnailPopup.style.display = 'none';
        }
    });
});


let file = null;
let stackFiles = []; // Stores all the uploaded File objects
let stackImgNum = 0;
const stackNumBox = document.querySelector('.stack-number-container');
const uploadSuccessful = document.querySelector('.success-upload-msg');
const thumbnailPopup = document.querySelector('.thumbnail-pop-up'); 
const thumbnailContainer = document.querySelector('.thumbnail-container'); 
const bgOverlay = document.querySelector('.overlay');

document.querySelector('input#fileInput').addEventListener('change', function (event) {
    file = event.target.files[0];

    if (file) {
        stackFiles.push(file); // Automatically stack the uploaded image
        updateStackDisplay(); // Update the thumbnail popup display
        updateStackStatus(); // Update stack status message
        showUploadEffect(); // Show success upload effect
    }
    this.value = ''; // Clear the file input
});

document.querySelector('.stack-number-container').addEventListener('click', function () {
    thumbnailPopup.style.display = 'flex'; 
    bgOverlay.style.display = 'flex'; 
});

document.querySelector('.discard-btn').addEventListener('click', function () {
    thumbnailPopup.style.display = 'none';
    bgOverlay.style.display = 'none';
});

// Function to update the thumbnail container display with stacked images
function updateStackDisplay() {
    thumbnailContainer.innerHTML = ''; // Clear previous images

    // Loop through each file and create a card for each
    stackFiles.forEach((file, index) => {
        let blobUrl = URL.createObjectURL(file); // Create temporary URL

        // Create a new card div and image element
        let card = document.createElement('div');
        card.classList.add('thumbnail-card');

        let img = document.createElement('img');
        img.classList.add('noteImage');
        img.src = blobUrl;
        img.alt = `Note Image ${index + 1}`;

        // Create delete icon and set up click event for deletion
        let deleteBtn = document.createElement('i');
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
    const noNotesMsg = document.querySelector('.no-notes');

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

async function publish() {
    try {
        if (stackFiles.length != 0) {
            let noteSubject = document.querySelector('.note-subject').value;
            let noteTitle = document.querySelector('.note-title').value;
            // const noteDescription = document.querySelector('.note-description').value
            const noteDescription = editor.getHTML();

            if(noteSubject && noteTitle && noteDescription !== "<p><br></p>") {
                let formData = new FormData();
                stackFiles.forEach((file, index) => {
                    formData.append(`image-${index}`, file);
                });
                formData.append('noteSubject', noteSubject);
                formData.append('noteTitle', noteTitle);
                formData.append('noteDescription', noteDescription);
    
                fetch('/upload', {
                        method: 'POST',
                        body: formData
                }).then(response => {
                    return response.json()
                }).then(data => {
                    if (data.error) {
                        hideLoader()
                    } else if (data.url) {
                        hideLoader(); // Hide the loader after the process
                        window.location.href = data.url;
                    }
                })
                
                showLoader()
            } else {
                setupErrorPopup('Please fill up all the available fields to upload.')
            }

        }
    } catch (error) {
        hideLoader(); // Hide the loader in case of an error
        alert(error.message);
    }
}

const editor = new toastui.Editor({
    el: document.querySelector('#editor'),
    previewStyle: 'none', // Disable split preview
    initialEditType: 'wysiwyg', // Lock in WYSIWYG mode
    height: '300px', // Adjusted height
    toolbarItems: [
        ['bold', 'italic', 'strike'],
        ['hr'], 
        ['link'], 
        ['quote', 'ul', 'ol'], 
    ],
    placeholder: "Describe your note in detail so others can know it's unique", 
    useCommandShortcut: true, // Enable shortcuts
    hideModeSwitch: true, // Hide the "Markdown" tab
});

