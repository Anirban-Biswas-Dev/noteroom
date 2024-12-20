import { Schema, model } from 'mongoose'

const alertsSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    type: String,
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
})


const alertsModel = model('alerts', alertsSchema)

export default alertsModel