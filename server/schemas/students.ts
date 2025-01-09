import { Schema, model } from 'mongoose'

const studentsSchema = new Schema({
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
            validator: (email: any) => email.includes("@"),
            message: (data: any) => `Email doesn't contain @`
        },
        unique: true,
        required: true
    },
    password: {
        type: String,
        default: null
    },
    studentID: {
        type: String,
        required: true,
        immutable: true,
        unique: true
    },
    rollnumber: {
        type: String,
        // required: true,
        default: "-"
    },
    collegesection: {
        type: String,
        default: "Not selected"
    },
    collegeyear: {
        type: String,
        default: "-"
    },
    authProvider: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        minLength: 0,
        maxLength: 300,
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
        type: String,
        default: "-"
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    owned_notes: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    saved_notes: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    featured_notes: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    downloaded_notes: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    badge: {
        type: String,
        default: "No Badge"
    },
    district: {
        type: String,
        required: true
    },
    collegeID: {
        type: Schema.Types.Mixed, //* Either the college name (custom one) or the college ID (pre-defined one)
        required: true
    }
})

const studentsModel = model('students', studentsSchema)

export default studentsModel