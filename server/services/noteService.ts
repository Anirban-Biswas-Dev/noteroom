import Students from '../schemas/students.js'
import Notes from '../schemas/notes.js'
import Feedbacks from '../schemas/feedbacks.js'

export interface IManageNote {
    studentDocID: string, // student._id
    noteDocID: string // note._id
}
export interface INote {
    ownerDocID: string,
    subject: string,
    title: string,
    description: string
}


export async function addNote(noteData: INote) {
    let note = await Notes.create(noteData)
    await Students.findByIdAndUpdate(
        noteData.ownerDocID,
        { $push: { owned_notes: note._id } },
        { upsert: true, new: true }
    )
    return note
}


export async function addSaveNote({ studentDocID, noteDocID }: IManageNote) {
    await Students.updateOne(
        { _id: studentDocID },
        { $addToSet: { saved_notes: noteDocID } },
        { new: true }
    )
}

export async function deleteSavedNote({ studentDocID, noteDocID }: IManageNote) {
    await Students.updateOne(
        { _id: studentDocID },
        { $pull: { saved_notes: noteDocID } }
    )
}

export async function getNote(noteDocID: string) {
    interface IReturnedNote {
        note: any,
        owner: any,
        feedbacks: any
    }
    
    if (noteDocID) {
        let note = await Notes.findById(noteDocID, { title: 1, subject: 1, description: 1, ownerDocID: 1, content: 1 })
        let owner = await Students.findById(note.ownerDocID, { displayname: 1, studentID: 1, profile_pic: 1, username: 1 })
        let feedbacks = await Feedbacks.find({ noteDocID: note._id })
            .populate('commenterDocID', 'displayname username studentID profile_pic').sort({ createdAt: -1 })

        let returnedNote: IReturnedNote = { note: note, owner: owner, feedbacks: feedbacks }
        return returnedNote
    }
}

export async function getAllNotes() {
    let notes = await Notes.find({}, { ownerDocID: 1, title: 1, content: 1, feedbackCount: 1 })
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('ownerDocID', 'profile_pic displayname studentID username')
    return notes
}

export async function getOwner(noteDocID: string) {
    let ownerUserName = (await Notes.findById(noteDocID, { ownerDocID: 1 }).populate('ownerDocID', 'username')).ownerDocID["username"]
    return ownerUserName
}