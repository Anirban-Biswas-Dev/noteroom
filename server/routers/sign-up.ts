import { IStudentDB } from './../types/database.types.js';
import { Router } from 'express'
import Students from '../schemas/students.js'
import { upload } from '../services/firebaseService.js'
import { Convert, SignUp } from '../services/userService.js'
import { generateRandomUsername, setSession } from '../helpers/utils.js'
import { Server } from 'socket.io'
import { verifyToken } from '../services/googleAuth.js';
import {fileURLToPath} from "url";
import {dirname, join} from "path";
import { config } from 'dotenv'

const router = Router()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') })

const client_id = process.env.GOOGLE_CLIENT_ID

function signupRouter(io: Server) {
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            res.redirect(`/dashboard`)
        } else {
            res.status(200)
            res.render('sign-up')
        }
    })

    //CRITICAL: there is no folder created for a student when using google-auth or noteroom-auth. when the onboard will be done, profile picture will be added in firebase in a user-folder
    router.post('/auth/google', async (req, res) => {
        try {
            let { id_token } = req.body

            let userData = await verifyToken(client_id, id_token)
            let identifier = generateRandomUsername(userData.name)
            let studentData: IStudentDB = {
                displayname: userData.name,
                email: userData.email,
                password: null,
                studentID: identifier["userID"],
                username: identifier["username"],
                authProvider: "google"
            }

            let student = await SignUp.addStudent(studentData)
            let studentDocID = student._id

            Students.findByIdAndUpdate(studentDocID, { profile_pic: userData.picture }).then(() => {
                setSession({recordID: studentDocID, studentID: student["studentID"]}, req, res)
                res.json({ redirect: "/dashboard" })
            })
            
            
        } catch (error) {
            if (error.code === 11000) {
                let duplicate_field = Object.keys(error.keyValue)[0] // Sending the first duplicated field name to the client-side to show an error
                io.emit('duplicate-value', duplicate_field)
            }
        }
    })

    router.post('/', async (req, res, next) => {
        try {
            let identifier = generateRandomUsername(req.body.displayname.trim())
            let studentData: IStudentDB = {
                displayname: req.body.displayname.trim(),
                email: req.body.email,
                password: req.body.password,
                studentID: identifier["userID"],
                // rollnumber: req.body.rollnumber.trim(),
                // collegesection: req.body.collegesection,
                // collegeyear: req.body.collegeyear,
                // bio: req.body.bio,
                // favouritesubject: req.body.favouritesubject,
                // notfavsubject: req.body.notfavsubject,
                // group: req.body.group,
                username: identifier["username"],
                authProvider: null
            } //* Getting all the data posted by the client except the profile picture

            // if (req.files) {
                // let profile_pic = Object.values(req.files)[0] //* Getting the profiloe picture File Object
                let student = await SignUp.addStudent(studentData)
                let studentDocID = student._id

                // let savePath = `${studentDocID.toString()}/${profile_pic["name"]}`
                // let profilePicUrl = upload(profile_pic, savePath)

                // Students.findByIdAndUpdate(studentDocID, { profile_pic: (await profilePicUrl).toString() }).then(() => {
                    // req.session["stdid"] = studentData.studentID // setting the session with the student ID
                    // res.cookie('recordID', student['_id'], {
                    //     secure: false,
                    //     maxAge: 1000 * 60 * 60 * 720
                    // }) // setting a cookie with a value of the document ID of the user
                    // res.cookie('studentID', student['studentID'], {
                    //     secure: false,
                    //     maxAge: 1000 * 60 * 60 * 720
                    // }) // setting a cookie with a value of the student ID
                    // res.send({ url: `/dashboard` })
                // }) //* Updating the student's record database to add the profile_pic image location so that it can be deirectly used by the front-end
                setSession({recordID: studentDocID, studentID: student['studentID']}, req, res)
                res.send({ url: `/dashboard` })
            // } else {
            //     throw new Error('Profile picture not found')
            // }
        //FIXME: try to enhance the error handling and follow some more structured and generalized way
        } catch (error) {
            if (error.code === 11000) {
                let duplicate_field = Object.keys(error.keyValue)[0] // Sending the first duplicated field name to the client-side to show an error
                io.emit('duplicate-value', duplicate_field)
            } else if (error.name === 'ValidationError') {
                let requiredFields = []
                let userDefineds = []

                for (let field in error.errors) {
                    if (error.errors[field].kind === 'required') {
                        requiredFields.push(field)
                    } else if (error.errors[field].kind === 'user defined') {
                        userDefineds.push({ fieldName: error.errors[field].path, errorMessage: error.errors[field].properties.message })
                    }
                }

                if (requiredFields.length > 0 || userDefineds.length > 0) {
                    res.send({
                        emptyFields: requiredFields,
                        userDefinedErrors: userDefineds
                    })
                }
            } else {
                res.send({ message: error.message })
            }
        }
    })

    router.post('/onboard', async (req, res, next) => {
        try {
            let profile_pic = Object.values(req.files)[0]
            console.log(profile_pic)
            let onboardData = { //* Onboarding data
                district: req.body['district'],
                collegeID: req.body['collegeId'] === 'null' ? req.body["collegeName"] : parseInt(req.body["collegeId"]),
                collegeyear: req.body['collegeYear'],
                group: req.body['group'],
                bio: req.body['bio'],
                favouritesubject: req.body['favSub'],
                notfavsubject: req.body['nonFavSub'],
                profile_pic: profile_pic
            }
            console.log(onboardData)
            res.json({ ok: true })
        } catch (error) {
            res.json({ ok: false })
            console.log(error)
        }
    })

    return router
}

export default signupRouter
