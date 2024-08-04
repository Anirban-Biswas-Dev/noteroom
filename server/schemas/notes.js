const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
    owners_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Root'
    },
    title: {
        type: String,
        maxLength: 50,
        required: true,
    },
    content: {
        type: String, // or URLs, if they are pictures
        required: true
    },
    description: {
        type: String,
        maxLength: 250,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        required: true
    },
    updatedAt: {
        type: Date
    }
})

const notesModel = mongoose.model('notes', notesSchema)

module.exports = notesModel