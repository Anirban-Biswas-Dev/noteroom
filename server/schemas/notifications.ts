import { Schema, model } from 'mongoose'

const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'notifs-test'
}

const NotifsSchema = new Schema({
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        default: ''
    }
}, baseOptions)
const NotifsModel = model('notifs-test', NotifsSchema)


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


const noteUploadConfirmationSchema = new Schema({
    noteDocID: {
        type: Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    ownerStudentID: String
})
const noteUploadConfirmationNotifs = NotifsModel.discriminator('note-upload-confirmation', noteUploadConfirmationSchema)


const generalNotifsSchema = new Schema({
    ownerStudentID: String,
    title: String
})
const generalNotifs = NotifsModel.discriminator('notification-general', generalNotifsSchema)

export { 
    NotifsModel as Notifs, 
    feedBackNotifs, 
    mentionNotifs, 
    replyNotifs, 
    votesNotifs, 
    commentVotesNotifs,
    noteUploadConfirmationNotifs as ntUploadConfirm,
    generalNotifs
}
  