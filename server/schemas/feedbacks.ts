import { Schema, model } from 'mongoose'

const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'feedbacks'
}

const CommentsSchema = new Schema({
    noteDocID: { // The noteDocID on which the comment is given
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'notes'
    },
    feedbackContents: {
        type: String, 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, baseOptions)
const CommentsModel = model('feedbacks', CommentsSchema)


const feedbackSchema = new Schema({
    commenterDocID: { // the user who gave the FEEDBACK
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
})
const feedbacksModel = CommentsModel.discriminator('feedback', feedbackSchema)


const replySchema = new Schema({
    commenterDocID: { // The user who gave the REPLY on a feedback
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    parentFeedbackDocId: { // The documentID of the feedback on which the reply the given
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'feedbacks'
    }
})
const replyModel = CommentsModel.discriminator('reply', replySchema)


export default CommentsModel
export {feedbacksModel, replyModel}