const mongoose = require('mongoose')

const interactionsSchema = new mongoose.Schema({
    noteid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Notes'
    },
    studentid: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        default: [],
        ref: 'Root'
    },
    interactionsCount: {
        type: Number,
        default: 0
    },
    interactionsType: {
        type: [String],
        default: []
    },
    reactionsType: {
        type: [String],
        default: []
    },
    commentsContents: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date
    }
})

const interactionsModel = mongoose.model('interactions', interactionsSchema)

module.exports = interactionsModel