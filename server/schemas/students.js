const mongoose = require('mongoose')

const studentsSchema = new mongoose.Schema({
    student_id: {
        type: String, // or ObjectID 
        required: true,
        immutable: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate: {
            validator: (email) => email.includes("@"),
            message: (data) => `${data.value} doesn't contain @`
        },
        default: "test@test.com"
    },
    bio: {
        type: String,
        minLength: 0,
        maxLength: 100,
        default: ""
    },
    profile_pic: {
        type: String, // I have to work on image saving in cloud and accessing those via url
        default: ""
    },
    user_name: {
        type: String,
        minLength: 5,
        maxLength: 20,
        default: ''
    },
    year: {
        type: String,
        default: ''
    },
    group: {
        type: String,
        default: ''
    },
    roll_number: {
        type: Number,
        default: ''
    },
    favourite_sub: {
        type: String,
        default: ""
    },
    non_fav_sub: {
        type: String,
        default: ""
    },
    owned_notes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Notes',
        default: []
    },
    saved_notes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Notes',
        default: []
    },
    featured_notes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Notes',
        default: []
    },
    downloaded_notes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Notes',
        default: []
    },
    badge: {
        type: String,
        default: "No Badge"
    }
})

const studentsModel = mongoose.model('students', studentsSchema)

module.exports = studentsModel