import Notes from "../schemas/notes.js";
import Feedbacks from "../schemas/feedbacks.js";
import { IFeedBackDB } from "../types/database.types.js";


export async function addFeedback(feedbackData: IFeedBackDB) {
    await Notes.findByIdAndUpdate(feedbackData.noteDocID, { $inc: { feedbackCount: 1 } })
    let feedback = await Feedbacks.create(feedbackData)
    let extendedFeedback = await Feedbacks.findById(feedback._id)
        .populate('commenterDocID', 'displayname username studentID profile_pic')
        .populate('noteDocID', 'title')
    // Populating with some basic info of the commenter and the notes to send that to all the users via websockets

    return extendedFeedback
}
