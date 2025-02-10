"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogIn = exports.SignUp = exports.SearchProfile = exports.Convert = void 0;
exports.getProfile = getProfile;
exports.changePassword = changePassword;
exports.deleteAccount = deleteAccount;
exports.deleteSessionsByStudentID = deleteSessionsByStudentID;
const students_js_1 = __importDefault(require("../schemas/students.js"));
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const firebaseService_js_1 = require("./firebaseService.js");
exports.Convert = {
    async getStudentID_username(username) {
        let studentID = (await students_js_1.default.findOne({ username: username }, { studentID: 1 }))["studentID"];
        return studentID;
    },
    async getDocumentID_studentid(studentID) {
        let documentID = (await students_js_1.default.findOne({ studentID: studentID }, { _id: 1 }))["_id"];
        return documentID;
    },
    async getUserName_studentid(studentID) {
        let username = (await students_js_1.default.findOne({ studentID: studentID }, { username: 1 }))["username"];
        return username;
    },
    async getStudentID_email(email) {
        let studentID = (await students_js_1.default.findOne({ email: email }, { studentID: 1 }))["studentID"];
        return studentID;
    },
    async getEmail_studentid(studentID) {
        let email = (await students_js_1.default.findOne({ studentID: studentID }, { email: 1 }))["email"];
        return email;
    },
    async getDisplayName_email(email) {
        let displayname = (await students_js_1.default.findOne({ email: email }, { displayname: 1 }))["displayname"];
        return displayname;
    },
    async getDocumentID_username(username) {
        let documentID = (await students_js_1.default.findOne({ username: username }, { _id: 1 }))["_id"];
        return documentID;
    }
};
exports.SearchProfile = {
    async getRandomStudent(sampleSize, exclude) {
        try {
            let students = await students_js_1.default.aggregate([
                { $match: { visibility: "public", username: { $nin: exclude } } },
                { $sample: { size: sampleSize } },
                { $project: { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0, collegeID: 1 } }
            ]);
            return students;
        }
        catch (error) {
            return [];
        }
    },
    async getMutualCollegeStudents(studentDocID) {
        let collegeID = (await students_js_1.default.findOne({ _id: studentDocID }, { collegeID: 1 }))["collegeID"];
        let students = await students_js_1.default.find({ collegeID: collegeID, visibility: "public", _id: { $ne: studentDocID } }, { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0, collegeID: 1 });
        return students;
    },
    async getStudent(searchTerm) {
        const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
        let students = await students_js_1.default.find({ displayname: { $regex: regex }, visibility: "public" }, { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0 });
        return students;
    }
};
exports.SignUp = {
    async addStudent(studentData) {
        let student = await students_js_1.default.create(studentData);
        return student;
    }
};
exports.LogIn = {
    async getProfile(email) {
        let student = await students_js_1.default.findOne({ email: email });
        return new Promise((resolve, reject) => {
            if (student) {
                resolve({
                    studentPass: student["password"],
                    recordID: student["_id"],
                    studentID: student["studentID"],
                    username: student["username"],
                    authProvider: student["authProvider"]
                });
            }
            else {
                reject('Sorry! No student account is associated with that email account');
            }
        });
    }
};
async function getProfile(studentID) {
    let student = await students_js_1.default.findOne({ studentID: studentID });
    let students_notes_ids = student['owned_notes'];
    let notes;
    if (students_notes_ids.length != 0) {
        notes = await notes_js_1.default.find({ _id: { $in: students_notes_ids } });
    }
    else {
        notes = 0;
    }
    return new Promise((resolve, reject) => {
        if ((student["length"] != 0)) {
            resolve({ student: student, notes: notes });
        }
        else {
            reject('No students found!');
        }
    });
}
async function changePassword(email, password, current_password) {
    try {
        if (!current_password) {
            await students_js_1.default.updateOne({
                $and: [
                    { email: email },
                    { password: { $ne: null } }
                ]
            }, { $set: { password: password } });
            return true;
        }
        else {
            let doc = await students_js_1.default.updateOne({
                $and: [
                    { email: email },
                    { password: { $eq: current_password } }
                ]
            }, { $set: { password: password } });
            return doc.matchedCount === 1 ? true : null;
        }
    }
    catch (error) {
        return false;
    }
}
async function deleteAccount(studentDocID, firebase = false) {
    try {
        let deleteResult = await students_js_1.default.deleteOne({ _id: studentDocID });
        if (deleteResult.deletedCount !== 0) {
            if (!firebase) {
                return { ok: true };
            }
            else {
                await (0, firebaseService_js_1.deleteNoteImages)({ studentDocID, noteDocID: '' }, false, true);
                return { ok: true };
            }
        }
        else {
            return { ok: false };
        }
    }
    catch (error) {
        return { ok: false };
    }
}
async function deleteSessionsByStudentID(studentID) {
    const sessionSchema = new mongoose_1.default.Schema({}, { collection: 'sessions', strict: false });
    const Session = mongoose_1.default.models.Session || mongoose_1.default.model('Session', sessionSchema);
    try {
        let result = await Session.deleteMany({
            session: { $regex: `"stdid":"${studentID}"` }
        });
        if (result.deletedCount !== 0) {
            return { ok: true };
        }
        else {
            return { ok: false };
        }
    }
    catch (error) {
        return { ok: false };
    }
}
