import { feedbacksModel } from "../schemas/comments.js"
import Notes from "../schemas/notes.js"
import votesModel, { CommentVotes } from "../schemas/votes.js"
import { ICommentVoteDB, IVoteDB } from "../types/database.types.js"

export default async function addVote({ noteDocID, voterStudentDocID, voteType }: IVoteDB) {
    await Notes.findByIdAndUpdate(noteDocID, { $inc: { upvoteCount : 1 } })
    let voteData = await votesModel.create({noteDocID, voterStudentDocID, voteType})
    return voteData.populate('noteDocID', 'title upvoteCount')
}

export async function deleteVote({ noteDocID, voterStudentDocID }: IVoteDB) {
    await votesModel.deleteOne({ $and: [{ noteDocID: noteDocID }, { voterStudentDocID: voterStudentDocID }] })
    await Notes.updateOne({ _id: noteDocID }, { $inc: { upvoteCount: -1 } })
}


export async function isUpVoted({ noteDocID, voterStudentDocID }: IVoteDB) {
    let upvote_doc = await votesModel.findOne({ $and: [ { noteDocID: noteDocID }, { voterStudentDocID: voterStudentDocID } ] })
    return upvote_doc ? true : false
}

export async function addCommentVote({ noteDocID, voterStudentDocID, voteType, feedbackDocID }: ICommentVoteDB) {
    await feedbacksModel.findByIdAndUpdate(feedbackDocID, { $inc: { upvoteCount: 1 } })
    let voteData = await CommentVotes.create({ noteDocID, voterStudentDocID, voteType, feedbackDocID })
    return voteData.populate([
        { path: 'noteDocID', select: 'title' },
        { path: 'voterStudentDocID', select: 'displayname' },
    ])
}

export async function deleteCommentVote({ feedbackDocID, voterStudentDocID }: ICommentVoteDB) {
    await feedbacksModel.findByIdAndUpdate(feedbackDocID, { $inc: { upvoteCount: -1 } })
    await CommentVotes.deleteOne({ $and: [{ feedbackDocID: feedbackDocID }, { voterStudentDocID: voterStudentDocID }] })
}

export async function isCommentUpVoted({ feedbackDocID, voterStudentDocID }) {
    let upvote_doc = await CommentVotes.findOne({ $and: [ { feedbackDocID: feedbackDocID }, { voterStudentDocID: voterStudentDocID } ] })
    return upvote_doc ? true : false
}