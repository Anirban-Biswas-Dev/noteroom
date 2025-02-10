import { IStudentDB } from './../types/database.types.js';
import { Router } from 'express'
import Students from '../schemas/students.js'
import { upload } from '../services/firebaseService.js'
import { Convert, SignUp } from '../services/userService.js'
import { compressImage, generateRandomUsername, setSession } from '../helpers/utils.js'
import { Server } from 'socket.io'
import { verifyToken } from '../services/googleAuth.js';
import {fileURLToPath} from "url";
import {dirname, join} from "path";
import { config } from 'dotenv'

const router = Router()

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

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
                authProvider: "google",
                onboarded: false
            }

            let student = await SignUp.addStudent(studentData)
            let studentDocID = student._id

            setSession({recordID: studentDocID, studentID: student["studentID"], username: student["username"] }, req, res)
            res.json({ redirect: "/onboarding" })
            
            
        } catch (error) {
            if (error.code === 11000) {
                let duplicate_field = Object.keys(error.keyValue)[0] // Sending the first duplicated field name to the client-side to show an error
                io.emit('duplicate-value', duplicate_field)
            } else {
                res.json({ ok: false })
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
                username: identifier["username"],
                authProvider: null,
                onboarded: false
            } //* Getting all the data posted by the client except the onboarding data

            
            let student = await SignUp.addStudent(studentData)
            let studentDocID = student._id

            setSession({recordID: studentDocID, studentID: student['studentID'], username: student["username"]}, req, res)
            res.json({ url: `/onboarding` })
            
        } catch (error) {
            if (error.code === 11000) {
                let duplicate_field = Object.keys(error.keyValue)[0] // Sending the first duplicated field name to the client-side to show an error
                io.emit('duplicate-value', duplicate_field)
            } else if (error.name === 'ValidationError') {
                let field = Object.keys(error.errors)[0] // from multiple errors, selecting the first one
                if (error.errors[field].kind === 'user defined') /* the error which is got from custom validator */ { 
                    res.json({ ok: false, error: { fieldName: error.errors[field].path, errorMessage: error.errors[field].properties.message } })
                }
            } else {
                res.send({ ok: false, message: error.message })
            }
        }
    })

    router.post('/onboard', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"]
            let studentDocID = await Convert.getDocumentID_studentid(studentID)

            let profile_pic = await compressImage(Object.values(req.files)[0])
            let savePath = `${studentDocID.toString()}/${profile_pic["name"]}`
            let profilePicUrl = await upload(profile_pic, savePath)

            let onboardData = { //* Onboarding data
                district: req.body['district'],
                collegeID: req.body['collegeId'] === 'null' ? req.body["collegeName"] : parseInt(req.body["collegeId"]),
                collegeyear: req.body['collegeYear'],
                group: req.body['group'],
                bio: req.body['bio'],
                favouritesubject: req.body['favSub'],
                notfavsubject: req.body['nonFavSub'],
                profile_pic: profilePicUrl,
                rollnumber: req.body["collegeRoll"],
                onboarded: true
            }
            
                        
            Students.findByIdAndUpdate(studentDocID, { $set: onboardData }, { upsert: false }).then(() => {
                res.send({ url: `/dashboard` })
            }) 

        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}

export default signupRouter
