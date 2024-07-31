const mongoose = require('mongoose')

const interactionsSchema = new mongoose.Schema({
    note_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Notes'
    },
    student_id: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        default: [],
        ref: 'Root'
    },
    interactions_count: {
        type: Number,
        default: 0
    },
    interactions_type: {
        type: [String],
        default: []
    },
    reactions_type: {
        type: [String],
        default: []
    },
    comments_contents: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date
    }
})

const interactionsModel = mongoose.model('interactions', interactionsSchema)

module.exports = interactionsModel