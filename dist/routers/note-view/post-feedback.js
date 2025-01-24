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
        async function replaceFeedbackText(feedbackText, removeFirst = false) {
            let mentions = (0, utils_1.checkMentions)(feedbackText);
            let modifiedFeedbackText = "";
            if (removeFirst) {
                let first_mention = mentions[0];
                modifiedFeedbackText = feedbackText.replace(`@${first_mention}`, '').trim();
            }
            else {
                modifiedFeedbackText = feedbackText;
            }
            if (mentions.length !== 0) {
                let users = await students_1.default.find({ username: { $in: mentions } }, { displayname: 1, username: 1 });
                let displaynames = mentions.map(username => {
                    let user = users.find(doc => doc.username === username);
                    return user.displayname;
                });
                return (0, utils_1.replaceMentions)(modifiedFeedbackText, displaynames);
            }
            else {
                return modifiedFeedbackText;
            }
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
                    await (0, ioNotifcationService_1.NotificationSender)(io, {
                        ownerStudentID: _ownerStudentID,
                        noteDocID: _noteDocID,
                        commenterDocID: commenterDocID
                    }).sendFeedbackNotification(feedback);
                }
                let mentions = (0, utils_1.checkMentions)(_feedbackContents);
                await (0, ioNotifcationService_1.NotificationSender)(io, {
                    noteDocID: _noteDocID,
                    commenterDocID: commenterDocID,
                    commenterStudentID: _commenterStudentID,
                }).sendMentionNotification(mentions, feedback);
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
                if (_commenterUserName === mentions_[0]) {
                    modifiedFeedbackText = await replaceFeedbackText(_replyContent, true);
                }
                else {
                    modifiedFeedbackText = await replaceFeedbackText(_replyContent);
                }
                await comments_1.replyModel.findByIdAndUpdate(_reply._id, { $set: { feedbackContents: modifiedFeedbackText } });
                let reply = await (0, feedbackService_1.getReply)(_reply._id);
                io.to(replyData.noteDocID).emit('add-reply', reply.toObject());
                if (_commenterUserName !== parentFeedbackCommenterInfo.username && mentions_[0] === parentFeedbackCommenterInfo.username) {
                    await (0, ioNotifcationService_1.NotificationSender)(io, {
                        noteDocID: _noteDocID,
                    }).sendReplyNotification(reply);
                }
                let modifiedMentions = mentions_[0] === parentFeedbackCommenterInfo.username ? mentions_.slice(1) : mentions_;
                await (0, ioNotifcationService_1.NotificationSender)(io, {
                    noteDocID: _noteDocID,
                    commenterDocID: commenterDocID,
                    commenterStudentID: _commenterStudentID
                }).sendMentionNotification(modifiedMentions, reply);
                res.json({ sent: true });
            }
            catch (error) {
                res.json({ sent: false });
            }
        }
    });
    return router;
}
