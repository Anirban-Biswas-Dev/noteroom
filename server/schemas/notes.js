const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
    ownerDocID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    title: {
        type: String,
        maxLength: 200,
        required: true,
    },
    content: {
        type: [String], // The directory where all the images are placed
        default: ['']
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