const mongoose = require('mongoose')

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
    docType: {
        type: String,
        required: true
    },
    ownerUsername: String, 
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const feedBackModel = mongoose.model('notifications', feedBackSchema)

module.exports.feedBackModel = feedBackModel
