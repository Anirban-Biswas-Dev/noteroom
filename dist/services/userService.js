"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogIn = exports.SignUp = exports.SearchProfile = exports.Convert = void 0;
exports.getProfile = getProfile;
exports.changePassword = changePassword;
exports.changeProfileDetails = changeProfileDetails;
exports.deleteAccount = deleteAccount;
exports.deleteSessionsByStudentID = deleteSessionsByStudentID;
const students_js_1 = __importDefault(require("../schemas/students.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const firebaseService_js_1 = require("./firebaseService.js");
const utils_js_1 = require("../helpers/utils.js");
exports.Convert = {
    async getStudentID_username(username) {
        try {
            let studentID = (await students_js_1.default.findOne({ username: username }, { studentID: 1 }))["studentID"];
            return studentID;
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On Convert.getStudentID_username for ${username}: ${error.message}`);
            return null;
        }
    },
    async getDocumentID_studentid(studentID) {
        try {
            let documentID = (await students_js_1.default.findOne({ studentID: studentID }, { _id: 1 }))["_id"];
            return documentID;
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On Convert.getDocumentID_studentid for ${studentID}: ${error.message}`);
            return null;
        }
    },
    async getUserName_studentid(studentID) {
        try {
            let username = (await students_js_1.default.findOne({ studentID: studentID }, { username: 1 }))["username"];
            return username;
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On Convert.getUserName_studentid for ${studentID}: ${error.message}`);
            return null;
        }
    },
    async getStudentID_email(email) {
        try {
            let studentID = (await students_js_1.default.findOne({ email: email }, { studentID: 1 }))["studentID"];
            return studentID;
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On Convert.getStudentID_email for ${email}: ${error.message}`);
            return null;
        }
    },
    async getEmail_studentid(studentID) {
        try {
            let email = (await students_js_1.default.findOne({ studentID: studentID }, { email: 1 }))["email"];
            return email;
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On Convert.getEmail_studentid for ${studentID}: ${error.message}`);
            return null;
        }
    },
    async getDisplayName_email(email) {
        try {
            let displayname = (await students_js_1.default.findOne({ email: email }, { displayname: 1 }))["displayname"];
            return displayname;
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On Convert.getDisplayName_email for ${email}: ${error.message}`);
            return null;
        }
    },
    async getDocumentID_username(username) {
        try {
            let documentID = (await students_js_1.default.findOne({ username: username }, { _id: 1 }))["_id"];
            return documentID;
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On Convert.getDocumentID_username for ${username}: ${error.message}`);
            return null;
        }
    }
};
exports.SearchProfile = {
    async getRandomStudent(sampleSize, exclude) {
        try {
            let students = await students_js_1.default.aggregate([
                { $match: { visibility: "public", username: { $nin: exclude }, onboarded: true } },
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
        let students = await students_js_1.default.find({ username: { $regex: regex }, visibility: "public", onboarded: true }, { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0 });
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
    try {
        let _student = await students_js_1.default.aggregate([
            { $match: { studentID: studentID } },
            { $lookup: {
                    from: 'badges',
                    localField: 'badges',
                    foreignField: 'badgeID',
                    as: 'badges'
                } },
            { $lookup: {
                    from: 'notes',
                    localField: 'owned_notes',
                    foreignField: '_id',
                    as: 'owned_notes'
                } }
        ]);
        return new Promise((resolve, reject) => {
            if (_student && _student["length"] !== 0) {
                resolve({ _student: _student[0] });
                (0, utils_js_1.log)('info', `On getProfile StudentID=${studentID || "--studentid--"}: Got user data`);
            }
            else {
                reject('No students found!');
                (0, utils_js_1.log)('error', `On getProfile StudentID=${studentID || "--studentid--"}: Couldn't got user data`);
            }
        });
    }
    catch (error) {
        (0, utils_js_1.log)('error', `On getProfile StudentID=${studentID || "--studentid--"}: ${error.message}`);
        return { _student: {} };
    }
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
async function changeProfileDetails(studentID, values) {
    const allowedFields = ['displayname', 'bio', 'profile_pic', 'favouritesubject', 'notfavsubject', 'rollnumber'];
    try {
        let fieldName = values.fieldName;
        if (allowedFields.includes(fieldName)) {
            if (fieldName !== 'profile_pic') {
                await students_js_1.default.updateOne({ studentID }, { $set: { [fieldName]: values.newValue } });
            }
            else {
                let student = await students_js_1.default.findOne({ studentID: studentID, onboarded: true }, { profile_pic: 1 });
                if (student) {
                    let prvProfilePicURL = student.profile_pic;
                    let savePath = `${student._id.toString()}/${values.newValue["name"]}`;
                    let profilePicUrl = await (0, firebaseService_js_1.upload)(values.newValue, savePath, prvProfilePicURL.split('/')[1] === 'images' ? undefined : { replaceWith: prvProfilePicURL });
                    if (profilePicUrl) {
                        await students_js_1.default.updateOne({ studentID }, { $set: { profile_pic: profilePicUrl } });
                    }
                    else {
                        return prvProfilePicURL;
                    }
                }
                else {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
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
    try {
        const sessionSchema = new mongoose_1.default.Schema({}, { collection: 'sessions', strict: false });
        const Session = mongoose_1.default.models.Session || mongoose_1.default.model('Session', sessionSchema);
        let result = await Session.deleteMany({
            session: { $regex: `"stdid":"${studentID}"` }
        });
        if (result.deletedCount !== 0) {
            (0, utils_js_1.log)('info', `On deleteSessionsByStudentID StudentID=${studentID || "--studentid--"}: Deleted session`);
            return { ok: true };
        }
        else {
            (0, utils_js_1.log)('info', `On deleteSessionsByStudentID StudentID=${studentID || "--studentid--"}: Couldn't delete session`);
            return { ok: false };
        }
    }
    catch (error) {
        (0, utils_js_1.log)('error', `On deleteSessionsByStudentID StudentID=${studentID || "--studentid--"}: ${error.message}`);
        return { ok: false };
    }
}
