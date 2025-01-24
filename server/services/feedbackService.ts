import Notes from "../schemas/notes.js";
import {feedbacksModel as Feedbacks, feedbacksModel, replyModel as Reply} from "../schemas/comments.js";
import { IFeedBackDB, IReplyDB } from "../types/database.types.js";


export async function addFeedback(feedbackData: IFeedBackDB) {
    await Notes.findByIdAndUpdate(feedbackData.noteDocID, { $inc: { feedbackCount: 1 } })
    let feedback = await Feedbacks.create(feedbackData)
    let extendedFeedback = await Feedbacks.findById(feedback._id)
        .populate('commenterDocID', 'displayname username studentID profile_pic')
        .populate({
            path: 'noteDocID',
            select: 'ownerDocID title',
            populate: {
                path: 'ownerDocID',
                select: 'studentID username'
            }
        })

        return extendedFeedback
    }
    
export async function getReply(replyDocID) {
    let extentedReply = await Reply.findById(replyDocID)
        .populate('commenterDocID', 'displayname username studentID profile_pic')
        .populate({
            path: 'parentFeedbackDocID',
            select: 'commenterDocID',
            populate: {
                path: 'commenterDocID',
                select: 'studentID username'
            }
        })
        .populate('noteDocID', 'title')
    return extentedReply
}

export async function addReply(replyData: IReplyDB) {
    await Notes.findByIdAndUpdate(replyData.noteDocID, { $inc: { feedbackCount: 1 } })
    await feedbacksModel.findByIdAndUpdate(replyData.parentFeedbackDocID, { $inc: { replyCount: 1 } })
    let reply = await Reply.create(replyData)
    return getReply(reply._id.toString())
}


