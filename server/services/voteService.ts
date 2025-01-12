import Notes from "../schemas/notes.js"
import votesModel from "../schemas/votes.js"
import { IVoteDB } from "../types/database.types.js"

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
