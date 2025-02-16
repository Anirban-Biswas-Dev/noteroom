import { model, Schema } from "mongoose";

const badgeSchema = new Schema({
    badgeID: {
        type: Number,
        default: 0
    }, 
    badgeText: {
        type: String,
        default: "No Badge"
    },
    badgeLogo: {
        type: String,
        default: "no_badge.png"
    }
})

const badgeModel = model('badges', badgeSchema)

export default badgeModel