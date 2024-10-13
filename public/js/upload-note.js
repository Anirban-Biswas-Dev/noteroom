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


let file = null
let stackFiles = [] //* All the stacked File Objects will be stored here
let stackImgNum = 0; // Stack size number will be stored here
let stackImgNumMsg = '';
const stackNumBox = document.querySelector('.stack-number-container');
const uploadSuccessful = document.querySelector('.success-upload-msg');
document.querySelector('input#fileInput').addEventListener('change', function (event) {
    file = event.target.files[0]
    let thumbnailPopup = document.querySelector('.thumbnail-pop-up'); // The hidden thumbnail
    let previewImage = document.querySelector('img#noteImage'); // The image in the thumnail
    let discardThumbnailSetup = document.querySelector('.discard-btn'); // The discard button
    let addToStack = document.querySelector('.thumbnail-addstack-btn'); // The add-stack button
    let bgOverlay = document.querySelector('.overlay')

    if (file) {
        thumbnailPopup.style.display = 'flex'
        bgOverlay.style.display = 'flex';

        // ----- Image Viewing on the popup page -----
        let blobUrl = URL.createObjectURL(file) // Creating a temporary link to preview the image 
        previewImage.src = blobUrl
        previewImage.onload = function () {
            URL.revokeObjectURL(previewImage.src)
        }
        // -------------------------------------------

        discardThumbnailSetup.addEventListener('click', function () {
            thumbnailPopup.style.display = 'none';
            bgOverlay.style.display = 'none';
        })

        addToStack.addEventListener('click', function () {
            let image = document.querySelector('input#fileInput')
            if (image.files[0] != undefined) {
                stackFiles.push(image.files[0]) // Adding File Object into the stack
                image.value = '' // Clearing file input
                thumbnailPopup.style.display = 'none'; // Closing the preview
                bgOverlay.style.display = 'none';
                console.log(stackFiles)
            function updateStackStatus () {
                    stackImgNum = stackFiles.length; 
                    let message = stackImgNum === 1 ? '1 Image Added' : `${stackImgNum} Images Added`;
                    document.querySelector('.stack-number').textContent = message;
                    if (stackImgNum >= 1 && stackImgNum <= 5) {
                        stackNumBox.style.backgroundColor = '#DEEDFF';
                        stackNumBox.style.borderColor = '#2D61D8'; 
                    } else if (stackImgNum >= 6) {
                        stackNumBox.style.backgroundColor = '#F2F8F0'; 
                        stackNumBox.style.borderColor = '#529F3D'; 
                    };
            }; 
            // function to show the temp msg on successful upload
            function showSuEffect() {
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
            updateStackStatus()
            showSuEffect();
                
            }
        })
    }
})

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
            let noteDescription = document.querySelector('.note-description').value;

            if(noteSubject && noteTitle && noteDescription) {
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