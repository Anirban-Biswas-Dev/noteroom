import { Schema, model } from 'mongoose'

const studentsSchema = new Schema({
    profile_pic: {
        type: String,
        default: ""
    },
    displayname: {
        type: String,
        validate: {
            validator: (displayname) => displayname != "",
            message: "Displayname is not provided" 
        }
    },
    email: {
        type: String,
        validate: [
            {
                validator: (email) => email != "",
                message: "Email is not provided" 
            },
            {
                validator: (email: any) => email.includes("@"),
                message: `The email addess is not valid`
            },
        ],
        unique: true,
    },
    password: {
        type: Schema.Types.Mixed,
        validate: {
            validator: (password) => password != "",
            message: "Password is not provided"
        }
    },
    studentID: {
        type: String,
        required: true,
        immutable: true,
        unique: true
    },
    rollnumber: {
        type: String
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
    visibility: {
        type: String,
        default: "public"
    },
    owned_notes: {
        type: [Schema.Types.ObjectId],
        ref: 'notes',
        default: []
    },
    owned_posts: {
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
        default: ""
    },
    collegeID: {
        type: Schema.Types.Mixed, //* Either the college name (custom one) or the college ID (pre-defined one)
        default: null
    }
})

const studentsModel = model('students', studentsSchema)

export default studentsModel