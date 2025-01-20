import Students from '../schemas/students.js'
import Notes from '../schemas/notes.js'
import Comments, { feedbacksModel as Feedbacks, replyModel as Reply} from '../schemas/comments.js'
import { INoteDB } from '../types/database.types.js'
import { IManageUserNote, INoteDetails } from '../types/noteService.types.js'
import { Notifs } from '../schemas/notifications.js'
import { deleteNoteImages } from './firebaseService.js'
import { isCommentUpVoted, isUpVoted } from './voteService.js'


export async function addNote(noteData: INoteDB) {
    let note = await Notes.create(noteData)
    await Students.findByIdAndUpdate(
        noteData.ownerDocID,
        { $push: { owned_notes: note._id } },
        { upsert: true, new: true }
    )
    return note
}


/**
* @description - Deleting a note will delete **the noteDocID from owned_notes**, **comments related to that noteDocID**, **notifications related to that noteDocID**, **images from firebase**
*/
export async function deleteNote({studentDocID, noteDocID}: IManageUserNote) {
    try {
        await Notes.deleteOne({ _id: noteDocID })
        await Students.updateOne(
            { _id: studentDocID },
            { $pull: { owned_notes: noteDocID } }
        )
        await Comments.deleteMany({ _id: noteDocID })
    
        let noteNotifs = await Notifs.find({ docType: { $in: ["note-feedback", "note-reply", "note-mention"] } })
        let noteSpecificNotifsDocIDs = noteNotifs.filter(noti => noti["noteDocID"].toString() === noteDocID).map(noti => noti["_id"])
        await Notifs.deleteMany({ _id: { $in: noteSpecificNotifsDocIDs } })
    
        await deleteNoteImages({ studentDocID, noteDocID })

        return true
    } catch (error) {
        return false
    }
}

export async function addSaveNote({ studentDocID, noteDocID }: IManageUserNote) {
    try {
        await Students.updateOne(
            { _id: studentDocID },
            { $addToSet: { saved_notes: noteDocID } },
            { new: true }
        )
    
        return true
    } catch (error) {
        return false
    }
}

export async function deleteSavedNote({ studentDocID, noteDocID }: IManageUserNote) {
    try {
        await Students.updateOne(
            { _id: studentDocID },
            { $pull: { saved_notes: noteDocID } }
        )
        return true
    } catch (error) {
        return false 
    }
}

export async function getNote({noteDocID, studentDocID}: IManageUserNote) {
    if (noteDocID) {
        let _note = (await Notes.findById(noteDocID, { title: 1, subject: 1, description: 1, ownerDocID: 1, content: 1, upvoteCount: 1 })).toObject()
        let _isNoteUpvoted = await isUpVoted({ noteDocID, voterStudentDocID: studentDocID })
        let _isSaved = await isSaved({ studentDocID, noteDocID })
        let note = { ..._note, isUpvoted: _isNoteUpvoted, isSaved: _isSaved }

        let owner = await Students.findById(note.ownerDocID, { displayname: 1, studentID: 1, profile_pic: 1, username: 1 })
        let feedbacks = await Feedbacks.find({ noteDocID: note._id })
            .populate('commenterDocID', 'displayname username studentID profile_pic').sort({ createdAt: -1 })

        let _extentedFeedbacks = feedbacks.map(async feedback => {
            let isupvoted = await isCommentUpVoted({ feedbackDocID: feedback._id.toString(), voterStudentDocID: studentDocID })
            let reply = await Reply.find({ parentFeedbackDocID: feedback._id })
                .populate('commenterDocID', 'username displayname profile_pic studentID')

            return [{...feedback.toObject(), isUpVoted: isupvoted}, reply]
        })
        let extendedFeedbacks = await Promise.all(_extentedFeedbacks)

        let returnedNote: INoteDetails = { note: note, owner: owner, feedbacks: extendedFeedbacks }
        return returnedNote
    }
}

export async function getAllNotes(studentDocID: string, options = { skip: 0, limit: 3 }) {
    let notes = await Notes.find({}, { ownerDocID: 1, title: 1, content: 1, feedbackCount: 1, upvoteCount: 1 })
        .sort({ createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit)
        .populate('ownerDocID', 'profile_pic displayname studentID username')
    
    let extentedNotes = await Promise.all(
        notes.map(async note => {
            let isupvoted = await isUpVoted({ noteDocID: note._id.toString(), voterStudentDocID: studentDocID, voteType: 'upvote' })
            let issaved = await isSaved({ noteDocID: note._id.toString(), studentDocID: studentDocID }) 
            return { ...note.toObject(), isUpvoted: isupvoted, isSaved: issaved }
        })
    )

    return extentedNotes
}

export async function getOwner({noteDocID}: IManageUserNote) {
    let ownerInfo = await Notes.findById(noteDocID, { ownerDocID: 1 }).populate('ownerDocID')
    return ownerInfo
}

export async function isSaved({ studentDocID, noteDocID }: IManageUserNote) {
    let document = await Students.find({ $and: 
        [ 
            { _id: studentDocID }, 
            { saved_notes: { $in: [noteDocID] } } 
        ]
    })
    return document.length !== 0 ? true : false
}
