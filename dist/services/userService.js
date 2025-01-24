"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogIn = exports.SignUp = exports.SearchProfile = exports.Convert = void 0;
exports.getProfile = getProfile;
exports.changePassword = changePassword;
const students_js_1 = __importDefault(require("../schemas/students.js"));
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
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
    async getDisplayName_studentID(studentID) {
        let displayname = (await students_js_1.default.findOne({ studentID: studentID }, { displayname: 1 }))["displayname"];
        return displayname;
    }
};
exports.SearchProfile = {
    async getRandomStudent(sampleSize) {
        let students = await students_js_1.default.aggregate([
            { $sample: { size: sampleSize } },
            { $project: { profile_pic: 1, displayname: 1, bio: 1, badge: 1, studentID: 1, username: 1 } }
        ]);
        return students;
    },
    async getStudent(searchTerm) {
        const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
        let students = await students_js_1.default.find({ displayname: { $regex: regex } }, { profile_pic: 1, displayname: 1, bio: 1, badge: 1, studentID: 1, username: 1 });
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
