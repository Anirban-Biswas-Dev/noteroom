async function download(noteTitle, links) {
    start() // start of animation

    try {
        let noteDetailes = new FormData()
        noteDetailes.append('noteTitle', noteTitle)
        noteDetailes.append('links', links)
    
        let response = await fetch('/download', {
            method: 'POST',
            body: noteDetailes
        })
        
        let blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
    
        link.href = url
        link.setAttribute('download', `${noteTitle}.zip`)
    
        document.body.appendChild(link)
        link.click()
        link.remove()
    
        URL.revokeObjectURL(url)    
    } catch (error) {
        console.error(error)
    } finally {
        finish() // end of animation
    }
}

function start() {
    document.querySelector('.status').style.display = 'flex'
}
function finish() {
    document.querySelector('.status').style.display = 'none'
}