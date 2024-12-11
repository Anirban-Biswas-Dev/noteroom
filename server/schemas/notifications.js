import { Schema, model } from 'mongoose'

const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'notifications'
}

const NotifsSchema = new Schema({
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
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, baseOptions)
const NotifsModel = model('notifications', NotifsSchema)


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
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const feedBackNotifs = NotifsModel.discriminator('feedback', feedBackSchema)


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
    ownerStudentID: String, // The person who is being mentioned
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const mentionNotifs = NotifsModel.discriminator('mention', mentionSchema)



export const Notifs = NotifsModel
const _feedBackNotifs = feedBackNotifs
export { _feedBackNotifs as feedBackNotifs }
const _mentionNotifs = mentionNotifs
export { _mentionNotifs as mentionNotifs }