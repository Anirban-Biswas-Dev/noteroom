"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const students_js_1 = __importDefault(require("../schemas/students.js"));
const firebaseService_js_1 = require("../services/firebaseService.js");
const userService_js_1 = require("../services/userService.js");
const utils_js_1 = require("../helpers/utils.js");
const googleAuth_js_1 = require("../services/googleAuth.js");
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const router = (0, express_1.Router)();
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '../.env') });
const client_id = process.env.GOOGLE_CLIENT_ID;
const avatars = [1, 2, 3, 4, 5].map(n => `/images/avatars/image-${n}.png`);
function signupRouter(io) {
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            res.redirect(`/dashboard`);
        }
        else {
            res.status(200);
            res.render('sign-up');
            (0, utils_js_1.log)('info', `On /sign-up StudentID=${req.session['stdid'] || "--studentid--"}: redirected to signup.`);
        }
    });
    router.post('/auth/google', async (req, res) => {
        try {
            let { id_token } = req.body;
            let userData = await (0, googleAuth_js_1.verifyToken)(client_id, id_token);
            let identifier = (0, utils_js_1.generateRandomUsername)(userData.name);
            let studentData = {
                displayname: userData.name,
                email: userData.email,
                password: null,
                studentID: identifier["userID"],
                username: identifier["username"],
                authProvider: "google",
                onboarded: false
            };
            let student = await userService_js_1.SignUp.addStudent(studentData);
            let studentDocID = student._id;
            (0, utils_js_1.setSession)({ recordID: studentDocID, studentID: student["studentID"], username: student["username"] }, req, res);
            res.json({ redirect: "/onboarding" });
            (0, utils_js_1.log)('info', `On /sign-up/auth/google StudentID=${student['studentID'] || "--studentid--"}: User is signed-up and got redirected to onboard`);
        }
        catch (error) {
            if (error.code === 11000) {
                let duplicate_field = Object.keys(error.keyValue)[0];
                io.emit('duplicate-value', duplicate_field);
            }
            else {
                (0, utils_js_1.log)('error', `On /sign-up/auth/google StudentID=${"--studentid--"}: Couldn't sign-up: ${error.message}`);
                res.json({ ok: false });
            }
        }
    });
    router.post('/', async (req, res, next) => {
        try {
            let identifier = (0, utils_js_1.generateRandomUsername)(req.body.displayname.trim());
            let studentData = {
                displayname: req.body.displayname.trim(),
                email: req.body.email,
                password: req.body.password,
                studentID: identifier["userID"],
                username: identifier["username"],
                authProvider: null,
                onboarded: false
            };
            let student = await userService_js_1.SignUp.addStudent(studentData);
            let studentDocID = student._id;
            (0, utils_js_1.setSession)({ recordID: studentDocID, studentID: student['studentID'], username: student["username"] }, req, res);
            res.json({ url: `/onboarding` });
            (0, utils_js_1.log)('info', `On /sign-up StudentID=${student['studentID'] || "--studentid--"}: User is signed-up and got redirected to onboard`);
        }
        catch (error) {
            if (error.code === 11000) {
                let duplicate_field = Object.keys(error.keyValue)[0];
                io.emit('duplicate-value', duplicate_field);
            }
            else if (error.name === 'ValidationError') {
                let field = Object.keys(error.errors)[0];
                if (error.errors[field].kind === 'user defined') {
                    res.json({ ok: false, error: { fieldName: error.errors[field].path, errorMessage: error.errors[field].properties.message } });
                }
            }
            else {
                (0, utils_js_1.log)('error', `On /sign-up StudentID=${"--studentid--"}: Couldn't sign-up: ${error.message}`);
                res.send({ ok: false, message: error.message });
            }
        }
    });
    router.post('/onboard', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"];
            let studentDocID = await userService_js_1.Convert.getDocumentID_studentid(studentID);
            let onboardData = {
                district: req.body['district'],
                collegeID: isNaN(Number(req.body['collegeId'])) ? req.body["collegeName"] : Number(req.body["collegeId"]),
                collegeyear: req.body['collegeYear'] === 'null' ? null : req.body['collegeYear'],
                group: req.body['group'],
                bio: req.body['bio'] === 'null' ? 'Just a student trying to make it through college!' : req.body['bio'],
                favouritesubject: req.body['favSub'],
                notfavsubject: req.body['nonFavSub'],
                profile_pic: avatars[Math.floor(Math.random() * 5)],
                rollnumber: req.body["collegeRoll"] === 'null' ? null : req.body["collegeRoll"],
                onboarded: true
            };
            (0, utils_js_1.log)('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Onboard data got successfully`);
            await students_js_1.default.findByIdAndUpdate(studentDocID, { $set: onboardData }, { upsert: false });
            res.json({ ok: true });
            (0, utils_js_1.log)('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Added primary onboard data in database. Redirection signal sent.`);
            if (req.files) {
                (async function () {
                    (0, utils_js_1.log)('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Profile picture is got for onboard`);
                    try {
                        let image = Object.values(req.files)[0];
                        let profile_pic = await (0, utils_js_1.compressImage)(image);
                        let savedPath = await (0, firebaseService_js_1.upload)(profile_pic, `${studentDocID.toString()}/${image["name"]}`);
                        if (savedPath) {
                            await students_js_1.default.findByIdAndUpdate(studentDocID, { $set: { profile_pic: savedPath } }, { upsert: false });
                            (0, utils_js_1.log)('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Updated onboard data with profile pic url.`);
                        }
                    }
                    catch (error) {
                        (0, utils_js_1.log)('error', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Profile picture can't be processed, keeping same (${onboardData.profile_pic}): ${error.message}`);
                    }
                })();
            }
        }
        catch (error) {
            (0, utils_js_1.log)('info', `On /onboard StudentID=${req.session["stdid"] || "--studentid--"}: Onboard failure. Sending ok=false kind=500: ${error.message}`);
            res.json({ ok: false, kind: 500 });
        }
    });
    return router;
}
exports.default = signupRouter;
