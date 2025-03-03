"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postNoteFeedbackRouter = postNoteFeedbackRouter;
const express_1 = require("express");
const userService_1 = require("../../services/userService");
const noteService_1 = require("../../services/noteService");
const utils_1 = require("../../helpers/utils");
const feedbackService_1 = require("../../services/feedbackService");
const ioNotifcationService_1 = require("../../services/io/ioNotifcationService");
const comments_1 = require("../../schemas/comments");
const students_1 = __importDefault(require("../../schemas/students"));
const router = (0, express_1.Router)();
function postNoteFeedbackRouter(io) {
    router.post('/postFeedback', async (req, res) => {
        const _commenterStudentID = req.body["commenterStudentID"];
        const _commenterUserName = await userService_1.Convert.getUserName_studentid(_commenterStudentID);
        const commenterDocID = (await userService_1.Convert.getDocumentID_studentid(_commenterStudentID)).toString();
        const _noteDocID = req.body["noteDocID"];
        const noteOwnerInfo = await (0, noteService_1.getOwner)({ noteDocID: _noteDocID });
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString();
        async function replaceFeedbackText(feedbackText) {
            let mentions = (0, utils_1.checkMentions)(feedbackText);
            if (mentions.length !== 0) {
                let users = await students_1.default.find({ username: { $in: mentions } }, { displayname: 1, username: 1 });
                let displaynames = mentions.map(username => {
                    let user = users.find(doc => doc.username === username);
                    return user.displayname;
                });
                return (0, utils_1.replaceMentions)(feedbackText, displaynames);
            }
            else {
                return feedbackText;
            }
        }
        async function sendMentionNotification(baseDocument, mentions, commenterDocID) {
            let mentionedStudentIDs = (await students_1.default.find({ username: { $in: mentions } }, { studentID: 1 })).map(data => data.studentID);
            mentionedStudentIDs.forEach(async (ownerStudentID) => {
                if (ownerStudentID === _commenterStudentID)
                    return;
                let postTitle = (baseDocument["noteDocID"]["title"]?.slice(0, 20) || baseDocument["noteDocID"]["description"].slice(0, 20)) + '...';
                let isQuickPost = baseDocument["noteDocID"]["postType"] === 'quick-post';
                await (0, ioNotifcationService_1.NotificationSender)(io, {
                    ownerStudentID: ownerStudentID,
                    redirectTo: isQuickPost ? `/view/quick-post/${_noteDocID}` : `/view/${_noteDocID}`
                }).sendNotification({
                    content: `mentioned you in a comment on "${postTitle}". Join the conversation!`,
                    event: 'notification-mention'
                }, commenterDocID);
            });
        }
        if (!req.body["reply"]) {
            try {
                let _feedbackContents = req.body["feedbackContents"];
                let feedbackData = {
                    noteDocID: _noteDocID,
                    commenterDocID: commenterDocID,
                    feedbackContents: await replaceFeedbackText(_feedbackContents)
                };
                let feedback = await (0, feedbackService_1.addFeedback)(feedbackData);
                io.to(feedbackData.noteDocID).emit('add-feedback', feedback.toObject());
                if (_ownerStudentID !== _commenterStudentID) {
                    let postTitle = (feedback['noteDocID']['title']?.slice(0, 20) || feedback['noteDocID']['description']?.slice(0, 20)) + '...';
                    let isQuickPost = feedback['noteDocID']['postType'] === 'quick-post';
                    await (0, ioNotifcationService_1.NotificationSender)(io, {
                        ownerStudentID: _ownerStudentID,
                        redirectTo: (isQuickPost ? `/view/quick-post/${_noteDocID}` : `/view/${_noteDocID}`) + `#${feedback["_id"].toString()}`
                    }).sendNotification({
                        content: `left a comment on "${postTitle}". Check it out!`,
                        event: 'notification-feedback',
                    }, commenterDocID);
                }
                let mentions = (0, utils_1.checkMentions)(_feedbackContents);
                await sendMentionNotification(feedback, mentions, commenterDocID);
                res.json({ sent: true });
            }
            catch (error) {
                res.json({ sent: false });
            }
        }
        else {
            try {
                let _replyContent = req.body["replyContent"];
                let mentions_ = (0, utils_1.checkMentions)(_replyContent);
                let modifiedFeedbackText = _replyContent;
                let replyData = {
                    noteDocID: _noteDocID,
                    commenterDocID: commenterDocID,
                    parentFeedbackDocID: req.body["parentFeedbackDocID"],
                };
                let _reply = await (0, feedbackService_1.addReply)(replyData);
                let parentFeedbackCommenterInfo = _reply["parentFeedbackDocID"]["commenterDocID"];
                modifiedFeedbackText = await replaceFeedbackText(_replyContent);
                await comments_1.replyModel.findByIdAndUpdate(_reply._id, { $set: { feedbackContents: modifiedFeedbackText } });
                let reply = await (0, feedbackService_1.getReply)(_reply._id);
                io.to(replyData.noteDocID).emit('add-reply', reply.toObject());
                if (_commenterUserName !== parentFeedbackCommenterInfo.username && mentions_[0] === parentFeedbackCommenterInfo.username) {
                    let postTitle = (reply['noteDocID']['title']?.slice(0, 20) || reply['noteDocID']['description']?.slice(0, 20)) + '...';
                    let isQuickPost = reply['noteDocID']['postType'] === 'quick-post';
                    await (0, ioNotifcationService_1.NotificationSender)(io, {
                        ownerStudentID: parentFeedbackCommenterInfo["studentID"],
                        redirectTo: (isQuickPost ? `/view/quick-post/${_noteDocID}` : `/view/${_noteDocID}` + `#${reply["_id"].toString()}`)
                    }).sendNotification({
                        content: `replied to your comment on "${postTitle}". See their response!`,
                        event: 'notification-reply'
                    }, commenterDocID);
                }
                let modifiedMentions = mentions_[0] === parentFeedbackCommenterInfo.username ? mentions_.slice(1) : mentions_;
                await sendMentionNotification(reply, modifiedMentions, commenterDocID);
                res.json({ sent: true });
            }
            catch (error) {
                res.json({ sent: false });
            }
        }
    });
    return router;
}
