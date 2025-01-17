"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFeedback = addFeedback;
exports.addReply = addReply;
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const comments_js_1 = require("../schemas/comments.js");
async function addFeedback(feedbackData) {
    await notes_js_1.default.findByIdAndUpdate(feedbackData.noteDocID, { $inc: { feedbackCount: 1 } });
    let feedback = await comments_js_1.feedbacksModel.create(feedbackData);
    let extendedFeedback = await comments_js_1.feedbacksModel.findById(feedback._id)
        .populate('commenterDocID', 'displayname username studentID profile_pic')
        .populate({
        path: 'noteDocID',
        select: 'ownerDocID title',
        populate: {
            path: 'ownerDocID',
            select: 'studentID username'
        }
    });
    return extendedFeedback;
}
async function addReply(replyData) {
    await notes_js_1.default.findByIdAndUpdate(replyData.noteDocID, { $inc: { feedbackCount: 1 } });
    let reply = await comments_js_1.replyModel.create(replyData);
    let extentedReply = await comments_js_1.replyModel.findById(reply._id)
        .populate('commenterDocID', 'displayname username studentID profile_pic')
        .populate({
        path: 'parentFeedbackDocID',
        select: 'commenterDocID',
        populate: {
            path: 'commenterDocID',
            select: 'studentID username'
        }
    })
        .populate('noteDocID', 'title');
    return extentedReply;
}
