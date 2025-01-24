import { feedbacksModel } from "../schemas/comments.js"
import Notes from "../schemas/notes.js"
import votesModel, { CommentVotes } from "../schemas/votes.js"
import { ICommentVoteDB, IVoteDB } from "../types/database.types.js"

export default async function addVote({ noteDocID, voterStudentDocID, voteType }: IVoteDB) {
    let existingVoteData = await votesModel.findOne({
        noteDocID: noteDocID,
        voterStudentDocID: voterStudentDocID,
        docType: { $ne: 'feedback' }
    })
    if (!existingVoteData) {
        let voteData = await votesModel.create({noteDocID, voterStudentDocID, voteType})
        await Notes.findByIdAndUpdate(noteDocID, { $inc: { upvoteCount : 1 } })
        return voteData.populate('noteDocID', 'title upvoteCount')
    } else {
        return { saved: false }
    }
}

export async function deleteVote({ noteDocID, voterStudentDocID }: IVoteDB) {
    let deleteResult = await votesModel.deleteOne({ $and: [{ noteDocID: noteDocID }, { voterStudentDocID: voterStudentDocID }] })
    if (deleteResult.deletedCount !== 0) {
        await Notes.updateOne({ _id: noteDocID }, { $inc: { upvoteCount: -1 } })
    } 
    let upvoteCount = (await Notes.findOne({ _id: noteDocID }, { upvoteCount: 1 })).upvoteCount
    return upvoteCount
}


export async function isUpVoted({ noteDocID, voterStudentDocID }: IVoteDB) {
    let upvote_doc = await votesModel.findOne({ $and: [ { docType: { $ne: 'feedback' } }, { noteDocID: noteDocID }, { voterStudentDocID: voterStudentDocID } ] })
    return upvote_doc ? true : false
}

export async function addCommentVote({ noteDocID, voterStudentDocID, voteType, feedbackDocID }: ICommentVoteDB) {
    let existingVoteData = await CommentVotes.findOne({
        noteDocID: noteDocID,
        voterStudentDocID: voterStudentDocID,
        docType: 'feedback'
    })
    if (!existingVoteData) {
        let voteData = await CommentVotes.create({ noteDocID, voterStudentDocID, voteType, feedbackDocID })
        await feedbacksModel.findByIdAndUpdate(feedbackDocID, { $inc: { upvoteCount: 1 } })
        return voteData.populate([
            { path: 'noteDocID', select: 'title' },
            { path: 'voterStudentDocID', select: 'displayname' },
            { 
                path: 'feedbackDocID', 
                select: 'upvoteCount commenterDocID',
                populate: {
                    path: 'commenterDocID',
                    select: 'username studentID'
                } 
            }
        ])
    } else {
        return { saved: false }
    }
}

export async function deleteCommentVote({ feedbackDocID, voterStudentDocID }: ICommentVoteDB) {
    let deleteResult = await CommentVotes.deleteOne({ $and: [ { docType: { $eq: 'feedback' } }, { feedbackDocID: feedbackDocID }, { voterStudentDocID: voterStudentDocID }] })
    if (deleteResult.deletedCount !== 0) {
        await feedbacksModel.findByIdAndUpdate(feedbackDocID, { $inc: { upvoteCount: -1 } })
        return { deleted: true }
    } else {
        return { deleted: false }
    }
}

export async function isCommentUpVoted({ feedbackDocID, voterStudentDocID }) {
    let upvote_doc = await CommentVotes.findOne({ $and: [ { docType: { $eq: 'feedback' } }, { feedbackDocID: feedbackDocID }, { voterStudentDocID: voterStudentDocID } ] })
    return upvote_doc ? true : false
}