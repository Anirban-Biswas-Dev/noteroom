const mongoose = require('mongoose')

const alertsSchema = new mongoose.Schema({
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


const alertsModel = mongoose.model('alerts', alertsSchema)

module.exports = alertsModel