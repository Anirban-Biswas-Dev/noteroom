import Notes from "../schemas/notes.js";
import {feedbacksModel as Feedbacks, feedbacksModel, replyModel as Reply} from "../schemas/comments.js";
import { IFeedBackDB, IReplyDB } from "../types/database.types.js";
import { IManageUserNote } from "../types/noteService.types.js";
import { isCommentUpVoted } from "./voteService.js";


export async function getComments({ noteDocID, studentDocID }: IManageUserNote) {
    try {
        let feedbacks = await Feedbacks.find({ noteDocID: noteDocID }).populate('commenterDocID', 'displayname username studentID profile_pic').sort({ createdAt: -1 })
        let _extentedFeedbacks = await Promise.all(
                feedbacks.map(async feedback => {
                let isupvoted = await isCommentUpVoted({ feedbackDocID: feedback._id.toString(), voterStudentDocID: studentDocID })
                let reply = await Reply.find({ parentFeedbackDocID: feedback._id })
                    .populate('commenterDocID', 'username displayname profile_pic studentID')
    
                return [{...feedback.toObject(), isUpVoted: isupvoted}, reply]
            })
        )
        return { ok: true, comments: _extentedFeedbacks }
    } catch (error) {
        return { ok: false }
    }
}


export async function addFeedback(feedbackData: any) {
    try {
        await Notes.findByIdAndUpdate(feedbackData.noteDocID, { $inc: { feedbackCount: 1 } })
        let feedback = await Feedbacks.create(feedbackData)
        let extendedFeedback = await Feedbacks.findById(feedback._id)
            .populate('commenterDocID', 'displayname username studentID profile_pic')
            .populate({
                path: 'noteDocID',
                select: 'ownerDocID title postType',
                populate: {
                    path: 'ownerDocID',
                    select: 'studentID username'
                }
            })
    
        return { ok: true, feedback: extendedFeedback }
    } catch (error) {
        return { ok: false }
    }
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
        .populate('noteDocID', 'title postType')
    return extentedReply
}

export async function addReply(replyData: IReplyDB) {
    try {
        await Notes.findByIdAndUpdate(replyData.noteDocID, { $inc: { feedbackCount: 1 } })
        await feedbacksModel.findByIdAndUpdate(replyData.parentFeedbackDocID, { $inc: { replyCount: 1 } })
        let reply = await Reply.create(replyData)
        let extentedReply = await Reply.findById(reply._id)
            .populate('commenterDocID', 'displayname username studentID profile_pic')
            .populate({
                path: 'parentFeedbackDocID',
                select: 'commenterDocID',
                populate: {
                    path: 'commenterDocID',
                    select: 'studentID username'
                }
            })
            .populate('noteDocID', 'title postType')

        return { ok: true, reply: extentedReply }
    } catch (error) {
        return { ok: false }
    }
}


