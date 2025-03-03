export async function saveNoteApi(noteID: any, isSaveNote: boolean) {
    try {
        let noteData = new FormData()
        noteData.append("noteDocID", noteID)

        await fetch(`http://127.0.0.1:2000/api/note/save?action=${isSaveNote ? 'delete' : 'save'}`, {
            method: 'post',
            body: noteData
        })

        return { ok: true }
    } catch (error) {
        return { ok: false }
    }
}


export async function voteNoteApi({ noteID, studentID }: { noteID: string, studentID: string }, upvote: boolean) {
    try {
        let voteData = new FormData()
        voteData.append('noteDocID', noteID)
        voteData.append('voterStudentID', studentID)
        
        await fetch(`http://127.0.0.1:2000/view/${noteID}/vote?type=upvote${upvote ? '&action=delete' : ''}`, {
            method: "post",
            body: voteData
        })
        return { ok: true }
    } catch (error) {
        return { ok: true, error: error }
    }
}
