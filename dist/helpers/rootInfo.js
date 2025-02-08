"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedNotes = getSavedNotes;
exports.getNotifications = getNotifications;
exports.profileInfo = profileInfo;
exports.unreadNotiCount = unreadNotiCount;
const students_js_1 = __importDefault(require("../schemas/students.js"));
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const notifications_js_1 = require("../schemas/notifications.js");
async function getSavedNotes(studentID) {
    let student = await students_js_1.default.findOne({ studentID: studentID }, { saved_notes: 1 });
    let saved_notes_ids = student['saved_notes'];
    let notes = await notes_js_1.default.find({ _id: { $in: saved_notes_ids } });
    return notes;
}
async function getNotifications(studentID) {
    let allNotifications = await notifications_js_1.Notifs.find({ ownerStudentID: studentID });
    let populatedNotifications = [];
    await Promise.all(allNotifications.map(async (notification) => {
        if (notification["docType"] === 'interaction') {
            let populatedNotification = await notification.populate('fromUserSudentDocID', 'displayname username profile_pic');
            populatedNotifications.push(populatedNotification);
        }
        else {
            populatedNotifications.push(notification);
        }
    }));
    return populatedNotifications;
}
async function profileInfo(studentID) {
    let profile = await students_js_1.default.findOne({ studentID: studentID });
    return profile;
}
async function unreadNotiCount(studentID) {
    let u = await notifications_js_1.Notifs.aggregate([
        { $match: { ownerStudentID: studentID } },
        { $match: { isRead: false } },
        { $count: "unReadCount" }
    ]);
    return new Promise(resolve => {
        if (u.length != 0) {
            resolve(u[0]["unReadCount"]);
        }
        else {
            resolve(0);
        }
    });
}
