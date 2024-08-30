const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
    noteid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    studentid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    feedbackContents: {
        type: String, // The feedback text 
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const feedbacksModel = mongoose.model('feedbacks', feedbackSchema)

module.exports = feedbacksModel