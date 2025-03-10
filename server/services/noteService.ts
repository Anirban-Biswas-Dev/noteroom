import Students from '../schemas/students.js'
import Notes from '../schemas/notes.js'
import Comments, { } from '../schemas/comments.js'
import { INoteDB, IQuickPostDB } from '../types/database.types.js'
import { IManageUserNote, INoteDetails } from '../types/noteService.types.js'
import { deleteNoteImages } from './firebaseService.js'
import { deleteAllVotes, isUpVoted } from './voteService.js'
import mongoose from 'mongoose'
import { JSDOM }  from 'jsdom'


export async function addNote(noteData: INoteDB) {
    let note = await Notes.create(noteData)
    await Students.findByIdAndUpdate(
        noteData.ownerDocID,
        { $push: { owned_notes: note._id } },
        { upsert: true, new: true }
    )
    return note
}


export async function addQuickPost(postData: IQuickPostDB) {
    let post = await Notes.create(postData)
    await Students.findByIdAndUpdate(
        postData.ownerDocID,
        { $push: { owned_posts: post._id } },
        { upsert: true, new: true }
    )
    return post
}


/**
* @description - Deleting a note will delete **the noteDocID from owned_notes**, **comments related to that noteDocID**, **notifications related to that noteDocID**, **images from firebase**
*/
export async function deleteNote({studentDocID, noteDocID}: IManageUserNote, post: boolean = false) {
    try {
        let deleteResult = await Notes.deleteOne({ _id: noteDocID, ownerDocID: studentDocID })
        if (deleteResult.deletedCount !== 0) {
            post ? 
                await Students.updateOne(
                    { _id: studentDocID },
                    { $pull: { owned_posts: noteDocID } }
                ) : await Students.updateOne(
                    { _id: studentDocID },
                    { $pull: { owned_notes: noteDocID } }
                )

            await Comments.deleteMany({ noteDocID: noteDocID })
            await deleteAllVotes(noteDocID)
            await deleteNoteImages({ studentDocID, noteDocID }, post)
        }
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
        let saved_notes_count = (await Students.findOne({ _id: studentDocID }, { saved_notes: 1 })).saved_notes.length
        let savedNote = await Notes.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(noteDocID) } },
            { $lookup: {
                localField: "ownerDocID",
                foreignField: "_id",
                from: "students",
                as: "ownerDocID"
            } },
            { $unwind: {
                path: "$ownerDocID"
            } },
            { $project: {
                title: 1,
                thumbnail: { $first: '$content' },
                "ownerDocID": 1
            } }
        ])
            
        return { ok: true, count: saved_notes_count, savedNote: savedNote }
    } catch (error) {
        return { ok: false }
    }
}

export async function deleteSavedNote({ studentDocID, noteDocID }: IManageUserNote) {
    try {
        await Students.updateOne(
            { _id: studentDocID },
            { $pull: { saved_notes: noteDocID } }
        )
        let saved_notes_count = (await Students.findOne({ _id: studentDocID }, { saved_notes: 1 })).saved_notes.length

        return { ok: true, count: saved_notes_count } 
    } catch (error) {
        return { ok: false }
    }
}

export async function getNote({noteDocID, studentDocID}: IManageUserNote, images: boolean = false) {
    try {
        if(!images) {
            let _note = (await Notes.findById(noteDocID, { title: 1, subject: 1, description: 1, ownerDocID: 1, upvoteCount: 1, postType: 1 })).toObject()
            let _isNoteUpvoted = await isUpVoted({ noteDocID, voterStudentDocID: studentDocID })
            let _isSaved = await isSaved({ studentDocID, noteDocID })
            let note = { ..._note, isUpvoted: _isNoteUpvoted, isSaved: _isSaved }
    
            let owner = await Students.findById(note.ownerDocID, { displayname: 1, studentID: 1, profile_pic: 1, username: 1 })
            
            let returnedNote: INoteDetails = { note: note, owner: owner }
            return returnedNote
        } else {
            /* For fethcing the notes seperatly via an api */
            let images = (await Notes.findById(noteDocID, { content: 1 })).content
            return images
        }
    } catch (error) {
        return { error: true }
    }
}

export async function getNoteForShare({noteDocID, studentDocID}: IManageUserNote) {
    let _note = await Notes.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(noteDocID) } },
        { $project: {
            title: 1,
            description: 1,
            thumbnail: { $first: "$content" }
        } }
    ])
    let note = _note[0]
    let parser = new JSDOM(note["description"])
    let description = parser.window.document.querySelector('body').textContent

    return { ...note, description: description }
}

export async function getAllNotes(studentDocID: string, options?: any) { 
    /*
    Linear Congruential Generator (LCG):
        X_n+1 = (A * X_n + C) mod M

        A = feedbackCount + 1234567
        C = (upvoteCount + 10) × 9876543 + (contentSize × 22695477)
        M = 2 ^ 32
        X_n = seed
    */
    let notes = await Notes.aggregate([
        { $match: { completed: { $eq: true }, type_: "public" } },
        { $lookup: {
            from: 'students',
            localField: 'ownerDocID',
            foreignField: '_id',
            as: 'ownerDocID'
        } },
        { $addFields: {
            A: { $add: [ "$feedbackCount", 1234567 ] },
            C: { $add: [
                { $multiply: [{ $add: [ "$upvoteCount", 10 ] }, 9876543] },
                { $multiply: [{ $add: [{ $size: "$content" }, 1] }, 22695477] }
            ]}
        } },
        { $addFields: {
            randomSort: { 
                $mod: [
                    { $add: [{ $multiply: ["$A", parseInt(options.seed)] }, "$C"] },
                    Math.pow(2, 32)
                ] 
            }
        } },
        { $unwind: {
            path: '$ownerDocID',
        } },
        { $project: {
            title: 1, description: 1,  
            feedbackCount: 1, upvoteCount: 1, 
            postType: 1, content: 1, randomSort: 1,
            createdAt: 1, pinned: 1,
            "ownerDocID._id": 1,
            "ownerDocID.profile_pic": 1,
            "ownerDocID.displayname": 1,
            "ownerDocID.studentID": 1,
            "ownerDocID.username": 1
        } },
        { $addFields: {
            isOwner: { $eq: ["$ownerDocID._id", new mongoose.Types.ObjectId(studentDocID)] }
        } },
        { $sort: { pinned: -1, randomSort: 1 } },
        { $skip: parseInt(options.skip) },
        { $limit: parseInt(options.limit) }
    ])
    
    let extentedNotes = await Promise.all(
        notes.map(async (note: any) => {
            let isupvoted = await isUpVoted({ noteDocID: note["_id"].toString(), voterStudentDocID: studentDocID, voteType: 'upvote' })
            let issaved = await isSaved({ noteDocID: note["_id"].toString(), studentDocID: studentDocID }) 
            return { ...note, isUpvoted: isupvoted, isSaved: issaved }
        })
    )

    return extentedNotes
}


export const manageProfileNotes = {
    async getNote(type?: "saved" | "owned", studentID?: string, noteDocID?: string) {
        if (!noteDocID) {
            let student = await Students.findOne({ studentID: studentID }, { saved_notes: 1, owned_notes: 1 })
            let notes_ids = student[type === "saved" ? "saved_notes" : "owned_notes"]
            let notes = await Notes.aggregate([
                { $match: { _id: { $in: notes_ids } } },
                { $lookup: {
                    from: 'students',
                    localField: 'ownerDocID',
                    foreignField: '_id',
                    as: 'ownerDocID'
                } },
                { $unwind: {
                    path: '$ownerDocID'
                } },
                { $project: {
                    title: 1,
                    thumbnail: { $first: '$content' },
                    "ownerDocID.displayname": 1,
                    "ownerDocID.username": 1,
                } }
            ])
            return notes
        } else {
            let note = await Notes.findOne({ _id: noteDocID })
            return note
        }
    },

    async getNoteCount(type: "saved" | "owned", studentID: string) {
        let student = await Students.findOne({ studentID: studentID }, { saved_notes: 1, owned_notes: 1 })
        let notes_ids = student[type === "saved" ? "saved_notes" : "owned_notes"]
        return notes_ids.length
    }
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
