const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
    ownerid: {
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
        type: [String], // or URLs, if they are pictures
        // required: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        // required: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const notesModel = mongoose.model('notes', notesSchema)

module.exports = notesModel