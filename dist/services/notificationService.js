"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readNoti = readNoti;
exports.deleteNoti = deleteNoti;
exports.deleteAllNoti = deleteAllNoti;
exports.addNoti = addNoti;
exports.addInteractionNoti = addInteractionNoti;
const notifications_js_1 = require("../schemas/notifications.js");
async function readNoti(notiID) {
    await notifications_js_1.Notifs.updateOne({ _id: notiID }, { $set: { isRead: true } });
}
async function deleteNoti(notiID) {
    await notifications_js_1.Notifs.deleteOne({ _id: notiID });
}
async function deleteAllNoti(ownerStudentID) {
    try {
        let result = await notifications_js_1.Notifs.deleteMany({ ownerStudentID: ownerStudentID });
        return result.deletedCount !== 0;
    }
    catch (error) {
        return false;
    }
}
async function addNoti(notiData) {
    let data = await notifications_js_1.Notifs.create(notiData);
    return data;
}
async function addInteractionNoti(notiData) {
    let data = await notifications_js_1.InteractionNotifs.create(notiData);
    return data.populate('fromUserSudentDocID', 'displayname username profile_pic');
}
