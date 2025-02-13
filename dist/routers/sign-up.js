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
function signupRouter(io) {
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            res.redirect(`/dashboard`);
        }
        else {
            res.status(200);
            res.render('sign-up');
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
                (0, utils_js_1.log)('error', `On /sign-up/auth/google StudentID=${"--studentid--"}: Couldn't sign-up`);
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
                (0, utils_js_1.log)('error', `On /sign-up StudentID=${"--studentid--"}: Couldn't sign-up`);
                res.send({ ok: false, message: error.message });
            }
        }
    });
    router.post('/onboard', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"];
            let studentDocID = await userService_js_1.Convert.getDocumentID_studentid(studentID);
            let profile_pic = await (0, utils_js_1.compressImage)(Object.values(req.files)[0]);
            let savePath = `${studentDocID.toString()}/${profile_pic["name"]}`;
            let profilePicUrl = await (0, firebaseService_js_1.upload)(profile_pic, savePath);
            let onboardData = {
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
            };
            (0, utils_js_1.log)('info', `On /sign-up/onboard StudentID=${studentID || "--studentid--"}: Successfully got data for oboard`);
            students_js_1.default.findByIdAndUpdate(studentDocID, { $set: onboardData }, { upsert: false }).then(() => {
                res.send({ url: `/dashboard` });
                (0, utils_js_1.log)('info', `On /sign-up/onboard StudentID=${studentID || "--studentid--"}: Successfully onboarded and redirected to dashboard`);
            });
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On /sign-up/onboard StudentID=${req.session["stdid"] || "--studentid--"}: Couldn't onboard the user`);
            res.json({ ok: false });
        }
    });
    return router;
}
exports.default = signupRouter;
