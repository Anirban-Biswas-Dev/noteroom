const host = 'http://localhost:2000'
const socket = io(host)

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

        addToStack.addEventListener('click', function (event) {
            let image = document.querySelector('input#fileInput')
            if (image.files[0] != undefined) {
                stackFiles.push(image.files[0]) // Adding File Object into the stack
                image.value = '' // Clearing file input
                thumbnailPopup.style.display = 'none'; // Closing the preview
                bgOverlay.style.display = 'none';
                console.log(stackFiles)
            }
        })
    }
})

function publish() { // The main publish function that will publish the note
    try {
        if (stackFiles.length != 0) {
            let noteSubject = document.querySelector('.note-subject').value
            let noteTitle = document.querySelector('.note-title').value
            let noteDescription = document.querySelector('.note-description').value

            let formData = new FormData()
            stackFiles.forEach((file, index) => {
                formData.append(`image-${index}`, file)
            })
            formData.append('noteSubject', noteSubject)
            formData.append('noteTitle', noteTitle)
            formData.append('noteDescription', noteDescription)

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => { return response.json() })
            .then(data => {
                if (data.error) {
                    alert(data.error)
                } else if (data.url) {
                    window.location.href = data.url // Redirecting to another page depending on the server-side data
                }
            }) // Uploading the client-side data(File Objects, subject, title, description) to the server
        }
    } catch (error) {
        alert(error.message)
    }
}
