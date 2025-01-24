"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readNoti = readNoti;
exports.deleteNoti = deleteNoti;
exports.addFeedbackNoti = addFeedbackNoti;
exports.addMentionNoti = addMentionNoti;
exports.addReplyNoti = addReplyNoti;
exports.addVoteNoti = addVoteNoti;
const notifications_js_1 = require("../schemas/notifications.js");
async function readNoti(notiID) {
    await notifications_js_1.Notifs.updateOne({ _id: notiID }, { $set: { isRead: true } });
}
async function deleteNoti(notiID) {
    await notifications_js_1.Notifs.deleteOne({ _id: notiID });
}
async function addFeedbackNoti(notiData) {
    let feednoti = await notifications_js_1.feedBackNotifs.create(notiData);
    return feednoti;
}
async function addMentionNoti(notiData) {
    let mentionoti = await notifications_js_1.mentionNotifs.create(notiData);
    return mentionoti;
}
async function addReplyNoti(replyData) {
    let replynoti = await notifications_js_1.replyNotifs.create(replyData);
    return replynoti;
}
async function addVoteNoti(voteData, isCommentVote = false) {
    if (!isCommentVote) {
        let votenoti = await notifications_js_1.votesNotifs.create(voteData);
        return votenoti;
    }
    else {
        let votenoti = await notifications_js_1.commentVotesNotifs.create(voteData);
        return votenoti;
    }
}
