import { Schema, model } from 'mongoose'

const notesSchema = new Schema({
    ownerDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    title: {
        type: String,
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
    isFeatured: {
        type: Boolean,
        default: false
    },
    feedbackCount: {
        type: Number,
        default: 0
    },
    upvoteCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    type_: {
        type: String,
        default: "private"
    },
    completed: {
        type: Boolean,
        default: false
    }
})

const notesModel = model('notes', notesSchema)

export default notesModel