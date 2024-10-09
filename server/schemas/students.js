const mongoose = require('mongoose')

const studentsSchema = new mongoose.Schema({
    profile_pic: {
        type: String, // I have to work on image saving in cloud and accessing those via url
        default: ""
    },
    displayname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate: {
            validator: (email) => email.includes("@"),
            message: (data) => `${data.value} doesn't contain @`
        },
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    studentID: {
        type: String, // college ID 
        required: true,
        immutable: true,
        unique: true
    },
    rollnumber: {
        type: Number,
        unique: true,
        required: true,
    },
    collegesection: {
        type: String,
        default: "Not selected"
    },
    collegeyear: {
        type: String
    },
    bio: {
        type: String,
        minLength: 0,
        maxLength: 100,
        default: ""
    },
    favouritesubject: {
        type: String,
        default: "Not selected"
    },
    notfavsubject: {
        type: String,
        default: "Not selected"
    },
    group: {
        type: String
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    owned_notes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    saved_notes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    featured_notes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    downloaded_notes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    badge: {
        type: String,
        default: "No Badge"
    }
})

const studentsModel = mongoose.model('students', studentsSchema)

module.exports = studentsModel