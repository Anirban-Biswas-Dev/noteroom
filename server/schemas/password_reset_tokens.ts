import { Schema, model } from "mongoose";

const tokenSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    reset_token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    expiresAt: {
        type: Date,
        default: new Date(Date.now() + 60 * 1000 * 60) 
    } 
})
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const tokensModel = model('password_reset_tokens', tokenSchema)
export default tokensModel
