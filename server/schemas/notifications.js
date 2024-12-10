const mongoose = require('mongoose')

const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'notifications'
}

const NotifsSchema = new mongoose.Schema({
    noteDocID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    commenterDocID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    feedbackDocID: {
        type: mongoose.Schema.Types.ObjectId,
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
const NotifsModel = mongoose.model('notifications', NotifsSchema)


const feedBackSchema = new mongoose.Schema({
    noteDocID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    commenterDocID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    feedbackDocID: {
        type: mongoose.Schema.Types.ObjectId,
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


const mentionSchema = new mongoose.Schema({
    noteDocID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    commenterDocID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    feedbackDocID: {
        type: mongoose.Schema.Types.ObjectId,
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



module.exports.Notifs = NotifsModel
module.exports.feedBackNotifs = feedBackNotifs
module.exports.mentionNotifs = mentionNotifs