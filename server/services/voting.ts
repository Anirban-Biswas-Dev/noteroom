import votesModel from "../schemas/votes.js"
import { IVoteDB } from "../types/database.types.js"

export default async function addVote({ noteDocID, voterStudentDocID, voteType }: IVoteDB) {
    await votesModel.create({noteDocID, voterStudentDocID, voteType})
}