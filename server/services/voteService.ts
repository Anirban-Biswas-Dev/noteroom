import Notes from "../schemas/notes.js"
import votesModel from "../schemas/votes.js"
import { IVoteDB } from "../types/database.types.js"

export default async function addVote({ noteDocID, voterStudentDocID, voteType }: IVoteDB) {
    await Notes.findByIdAndUpdate(noteDocID, { $inc: { upvoteCount : 1 } })
    let voteData = await votesModel.create({noteDocID, voterStudentDocID, voteType})
    return voteData.populate('noteDocID', 'title upvoteCount')
}