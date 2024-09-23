function download() {
    // let noteDetailes = new FormData()
    // let noteID = document.querySelector('.note-id').innerHTML
    // noteDetailes.append('noteTitle', `${document.querySelector('.section-title').innerHTML.trim()}_${noteID}`)
    
    // let links = []
    // document.querySelectorAll('.image-links').forEach(image => {
    //     links.push(image.src)
    // })
    // noteDetailes.append('links', JSON.stringify(links)) 

    // fetch(`${noteID}/download`, {
    //     method: 'POST',
    //     body: noteDetailes
    // }).then(response => { return response.json() })
    //   .then(data => {
    //     if(data.status === 200) {
    //         alert(data.message) /* If you want to see the data object, go the routers/note-view.js 122,125 */
    //         document.querySelector('.status').style.display = 'none' /* Hiding the download-pending popup */
    //     } else {
    //         alert(data.message)
    //     }
    // })
    //   .catch(err => { alert(err.message) })

    // document.querySelector('.status').style.display = 'flex' /* Triggering a download-pending popup */
    alert('Download feature is under development')
}

function share() {
    alert('Under development')
}