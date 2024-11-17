const mongoose = require('mongoose')

const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'notifications' 
}

const NotifsSchema = new mongoose.Schema({}, baseOptions)
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
    ownerUsername: String,
    ownerStudentID: String,
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false })
const feedBackNotifs = NotifsModel.discriminator('feedback', feedBackSchema)

module.exports.Notifs = NotifsModel
module.exports.feedBackNotifs = feedBackNotifs
