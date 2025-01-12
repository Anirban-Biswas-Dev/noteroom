import { Schema, model } from 'mongoose'

const votesSchema = new Schema({
    noteDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "notes"
    },
    voterStudentDocID: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "students"
    },
    voteType: {
        type: String,
        enum: ["upvote", "downvote"],
        default: "upvote"
    }
})


const votesModel = model('votes', votesSchema)

export default votesModel