import { Schema, model } from 'mongoose'

const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'notifs'
}

const NotifsSchema = new Schema({
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, baseOptions)
const NotifsModel = model('notifs', NotifsSchema)


const feedBackSchema = new Schema({
    noteDocID: {
        type: Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    commenterDocID: {
        type: Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    feedbackDocID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    ownerStudentID: String,
})
const feedBackNotifs = NotifsModel.discriminator('note-feedback', feedBackSchema)


const mentionSchema = new Schema({
    noteDocID: {
        type: Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    commenterDocID: {
        type: Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    feedbackDocID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    mentionedStudentID: String, // The person who is being mentioned
}) 
const mentionNotifs = NotifsModel.discriminator('note-mention', mentionSchema)



const replySchema = new Schema({
    noteDocID: {
        type: Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    commenterDocID: {
        type: Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    parentFeedbackDocID: { // This is needed for sending notification to the user who gave the feedback
        type: Schema.Types.ObjectId,
        required: true
    },
    feedbackDocID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    ownerStudentID: String, // The person who owns the note
})
const replyNotifs = NotifsModel.discriminator('note-reply', replySchema)



const voteSchema = new Schema({
    noteDocID: {
        type: Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    voteDocID: {
        type: Schema.Types.ObjectId,
        ref: 'votes',
        required: true
    },
    voterDocID: {
        type: Schema.Types.ObjectId,
        ref: 'students',
        required: true
    },
    ownerStudentID: String
})
const votesNotifs = NotifsModel.discriminator('note-vote', voteSchema)
const commentVotesNotifs = NotifsModel.discriminator('note-comment-vote', voteSchema)




export const Notifs = NotifsModel
const _feedBackNotifs = feedBackNotifs
export { _feedBackNotifs as feedBackNotifs }
const _mentionNotifs = mentionNotifs
export { _mentionNotifs as mentionNotifs }
const _replyNotifs = replyNotifs
export { _replyNotifs as replyNotifs }
const _votesNotifs = votesNotifs
export { _votesNotifs as votesNotifs }
const _commentVotesNotifs = commentVotesNotifs
export { _commentVotesNotifs as commentVotesNotifs }