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

document.querySelector('input#fileInput').addEventListener('change', function (event) {
    fileList = event.target.files // One/more fileList objects

    let thumbnailPopup = document.querySelector('.thumbnail-pop-up'); // The hidden thumbnail
    let previewImage = document.querySelector('.thumbnail-container'); // The image in the thumnail
    let discardThumbnailSetup = document.querySelector('.discard-btn'); // The discard button
    let addToStack = document.querySelector('.thumbnail-addstack-btn'); // The add-stack button
    let bgOverlay = document.querySelector('.overlay')

    function clearPreview() {
        thumbnailPopup.style.display = 'none';
        bgOverlay.style.display = 'none';
        document.querySelector('input#fileInput').value = ''
        previewImage.innerHTML = ''
    }

    function updateStackStatus (imageList) {
        stackImgNum = imageList.length; 
        let message = stackImgNum === 1 ? '1 Image Added' : `${stackImgNum} Images Added`;
        document.querySelector('.stack-number').textContent = message;
        if (stackImgNum >= 1 && stackImgNum <= 5) {
            stackNumBox.style.backgroundColor = '#DEEDFF';
            stackNumBox.style.borderColor = '#2D61D8'; 
        } else if (stackImgNum >= 6) {
            stackNumBox.style.backgroundColor = '#F2F8F0'; 
            stackNumBox.style.borderColor = '#529F3D'; 
        };
    } 
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

    for(let i = 0; i < fileList.length; i ++) {
        let file = fileList[i]
        let blobURL = URL.createObjectURL(file) // 1. Each file's blob url
        
        let image = document.createElement("img")
        image.src = blobURL // 2. clearting an image element and adding the image
        
        previewImage.appendChild(image) // 3. adding the image inside the preview
        image.onload = function() {
            URL.revokeObjectURL(file)
        }
    }

    thumbnailPopup.style.display = 'flex' // 4. After adding all the images inside the preview, showing the preview

    discardThumbnailSetup.addEventListener('click', function () {
        clearPreview()
    })   
    addToStack.addEventListener('click', function () {
        for(let i = 0; i < fileList.length; i ++) {
            stackFiles.push(fileList[i])
        }
        updateStackStatus(stackFiles)
        showSuEffect()
        clearPreview()
    })
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

