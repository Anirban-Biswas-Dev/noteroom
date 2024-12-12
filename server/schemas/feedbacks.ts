import { Schema, model } from 'mongoose'

const feedbackSchema = new Schema({
    noteDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'notes'
    },
    commenterDocID: {
        type: Schema.Types.ObjectId,
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

const feedbacksModel = model('feedbacks', feedbackSchema)

export default feedbacksModel