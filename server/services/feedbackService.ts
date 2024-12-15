import Notes from "../schemas/notes.js";
import {feedbacksModel as Feedbacks, replyModel as Reply} from "../schemas/comments.js";
import { IFeedBackDB, IReplyDB } from "../types/database.types.js";


export async function addFeedback(feedbackData: IFeedBackDB) {
    await Notes.findByIdAndUpdate(feedbackData.noteDocID, { $inc: { feedbackCount: 1 } })
    let feedback = await Feedbacks.create(feedbackData)
    let extendedFeedback = await Feedbacks.findById(feedback._id)
        .populate('commenterDocID', 'displayname username studentID profile_pic')
        .populate('noteDocID', 'title')
    // Populating with some basic info of the commenter and the notes to send that to all the users via websockets

    return extendedFeedback
}

/* 
{
  _id: new ObjectId('675e84c5159867f4f9444dfe'),
  noteDocID: new ObjectId('6712fdf9eed60225d6aff2f8'),
  feedbackContents: 'Hello world',
  docType: 'replies',
  commenterDocID: {
    _id: new ObjectId('670955a378c4ceb3504985b7'),
    profile_pic: 'https://storage.googleapis.com/noteroom-fb1a7.appspot.com/670955a378c4ceb3504985b7/3d-rendering-kid-playing-digital-game (1).jpg',
    displayname: 'Rafi Rahman',
    studentID: '9181e241-575c-4ef3-9d3c-2150eac4566d',
    username: 'rafi-rahman-9181e241'
  },
  parentFeedbackDocID: {
    _id: new ObjectId('675e71569add058a2ad3e804'),
    docType: 'feedbacks',
    commenterDocID: {
      _id: new ObjectId('670955a378c4ceb3504985b7'),
      studentID: '9181e241-575c-4ef3-9d3c-2150eac4566d',
      username: 'rafi-rahman-9181e241'
    }
  },
  createdAt: 2024-12-15T07:27:01.042Z,
  __v: 0
}
 */

export async function addReply(replyData: IReplyDB) {
    await Notes.findByIdAndUpdate(replyData.noteDocID, { $inc: { feedbackCount: 1 } })
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
    return extentedReply
}