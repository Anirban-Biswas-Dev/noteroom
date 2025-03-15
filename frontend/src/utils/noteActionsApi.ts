export async function saveNoteApi(noteID: any, isSaveNote: boolean) {
    try {
        let response = await fetch(`http://127.0.0.1:2000/api/posts/${noteID}/save?action=${isSaveNote ? 'delete' : 'save'}`, { method: 'put' })
        if (response.ok) {
            let data = await response.json()
            return { ok: data.ok }
        } else {
            return { ok: false }
        }
    } catch (error) {
        return { ok: false }
    }
}


//TODO: remove the studentID
export async function voteNoteApi({ noteID, studentID }: { noteID: string, studentID: string }, upvote: boolean) {
    try {        
        let response = await fetch(`http://127.0.0.1:2000/api/posts/${noteID}/vote?type=upvote${upvote ? '&action=delete' : ''}`, { method: "post" })
        if (response.ok) {
            let data = await response.json()
            return { ok: data.ok }
        } else {
            return { ok: false }
        }
    } catch (error) {
        return { ok: true, error: error }
    }
}
