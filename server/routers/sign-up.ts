import { IStudentDB } from './../types/database.types.js';
import { Router } from 'express'
import Students from '../schemas/students.js'
import { upload } from '../services/firebaseService.js'
import { Convert, SignUp } from '../services/userService.js'
import { compressImage, generateRandomUsername, log, setSession } from '../helpers/utils.js'
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
const avatars = [1, 2, 3, 4, 5].map(n => `/images/avatars/image-${n}.png`)

function signupRouter(io: Server) {
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            res.redirect(`/dashboard`)
        } else {
            res.status(200)
            res.render('sign-up')
            log('info', `On /sign-up StudentID=${req.session['stdid'] || "--studentid--"}: redirected to signup.`)
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
            log('info', `On /sign-up/auth/google StudentID=${student['studentID'] || "--studentid--"}: User is signed-up and got redirected to onboard`)
            
        } catch (error) {
            if (error.code === 11000) {
                let duplicate_field = Object.keys(error.keyValue)[0] // Sending the first duplicated field name to the client-side to show an error
                io.emit('duplicate-value', duplicate_field)
            } else {
                log('error', `On /sign-up/auth/google StudentID=${"--studentid--"}: Couldn't sign-up: ${error.message}`)
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
            } 

            let student = await SignUp.addStudent(studentData)
            let studentDocID = student._id

            setSession({recordID: studentDocID, studentID: student['studentID'], username: student["username"]}, req, res)
            res.json({ url: `/onboarding` })
            log('info', `On /sign-up StudentID=${student['studentID'] || "--studentid--"}: User is signed-up and got redirected to onboard`)
            
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
                log('error', `On /sign-up StudentID=${"--studentid--"}: Couldn't sign-up: ${error.message}`)
                res.send({ ok: false, message: error.message })
            }
        }
    })

    router.post('/onboard', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"]
            let studentDocID = await Convert.getDocumentID_studentid(studentID)

            let onboardData = {
                district: req.body['district'], //! Required
                collegeID: isNaN(Number(req.body['collegeId'])) ? req.body["collegeName"] : Number(req.body["collegeId"]), //! Required
                collegeyear: req.body['collegeYear'] === 'null' ? null : req.body['collegeYear'],
                group: req.body['group'], //! Required
                bio: req.body['bio'] === 'null' ? 'Just a student trying to make it through college!' : req.body['bio'],
                favouritesubject: req.body['favSub'], //! Required
                notfavsubject: req.body['nonFavSub'], //! Required
                profile_pic: avatars[Math.floor(Math.random() * 5)],
                rollnumber: req.body["collegeRoll"] === 'null' ? null : req.body["collegeRoll"],
                onboarded: true
            }
            log('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Onboard data got successfully`)

            await Students.findByIdAndUpdate(studentDocID, { $set: onboardData }, { upsert: false })
            res.json({ ok: true }) 
            log('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Added primary onboard data in database. Redirection signal sent.`)
            
            if (req.files) {
                (async function() {
                    log('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Profile picture is got for onboard`)
                    try {
                        let image = Object.values(req.files)[0]
                        let profile_pic = await compressImage(image) 
                        let savedPath = await upload(profile_pic, `${studentDocID.toString()}/${image["name"]}`) 
                        if (savedPath) {
                            await Students.findByIdAndUpdate(studentDocID, { $set: { profile_pic: savedPath } }, { upsert: false })
                            log('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Updated onboard data with profile pic url.`)
                        }
                    } catch (error) {
                        log('error', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Profile picture can't be processed, keeping same (${onboardData.profile_pic}): ${error.message}`)
                    }
                })()
            }

        } catch (error) {
            log('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Onboard failure. Sending ok=false kind=500: ${error.message}`)
            res.json({ ok: false, kind: 500 })
        }
    })

    return router
}

export default signupRouter
