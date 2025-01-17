"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const students_js_1 = __importDefault(require("../schemas/students.js"));
const utils_js_1 = require("../helpers/utils.js");
const rootInfo_js_1 = require("../helpers/rootInfo.js");
const noteService_js_1 = require("../services/noteService.js");
const userService_js_1 = require("../services/userService.js");
const feedbackService_js_1 = require("../services/feedbackService.js");
const voteService_js_1 = __importStar(require("../services/voteService.js"));
const ioNotifcationService_js_1 = require("../services/io/ioNotifcationService.js");
const router = (0, express_1.Router)();
function noteViewRouter(io) {
    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID;
            let noteInformation = await (0, noteService_js_1.getNote)({ noteDocID });
            let root = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
            let [note, owner, feedbacks] = [noteInformation['note'], noteInformation['owner'], noteInformation['feedbacks']];
            let mynote;
            if (req.session["stdid"]) {
                if (noteDocID) {
                    let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
                    let notis = await (0, rootInfo_js_1.getNotifications)(req.session["stdid"]);
                    let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
                    let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
                    let isUpvoted = await (0, voteService_js_1.isUpVoted)({ noteDocID: noteDocID, voterStudentDocID: studentDocID, voteType: 'upvote' });
                    let issaved = await (0, noteService_js_1.isSaved)({ noteDocID, studentDocID });
                    if (note.ownerDocID == req.cookies['recordID']) {
                        mynote = 1;
                        res.render('note-view/note-view', { isSaved: issaved, note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount, isUpvoted });
                    }
                    else {
                        mynote = 0;
                        res.render('note-view/note-view', { isSaved: issaved, note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount, isUpvoted });
                    }
                }
            }
            else {
                mynote = 3;
                res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: owner });
            }
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/:noteID/postFeedback', async (req, res) => {
        const _commenterStudentID = req.body["commenterStudentID"];
        const commenterDocID = (await userService_js_1.Convert.getDocumentID_studentid(_commenterStudentID)).toString();
        const _noteDocID = req.body["noteDocID"];
        const noteOwnerInfo = await (0, noteService_js_1.getOwner)({ noteDocID: _noteDocID });
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString();
        async function replaceFeedbackText(feedbackText) {
            let mentions = (0, utils_js_1.checkMentions)(feedbackText);
            if (mentions.length !== 0) {
                let displayNames = (await students_js_1.default.find({ username: { $in: mentions } }, { displayname: 1 })).map(data => data.displayname.toString()).reverse();
                return (0, utils_js_1.replaceMentions)(feedbackText, displayNames);
            }
            else {
                return feedbackText;
            }
        }
        if (!req.body["reply"]) {
            let _feedbackContents = req.body["feedbackContents"];
            let feedbackData = {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                feedbackContents: await replaceFeedbackText(_feedbackContents)
            };
            let feedback = await (0, feedbackService_js_1.addFeedback)(feedbackData);
            io.to(feedbackData.noteDocID).emit('add-feedback', feedback.toObject());
            if (_ownerStudentID !== _commenterStudentID) {
                await (0, ioNotifcationService_js_1.NotificationSender)(io, {
                    ownerStudentID: _ownerStudentID,
                    noteDocID: _noteDocID,
                    commenterDocID: commenterDocID
                }).sendFeedbackNotification(feedback);
            }
            let mentions = (0, utils_js_1.checkMentions)(_feedbackContents);
            await (0, ioNotifcationService_js_1.NotificationSender)(io, {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                commenterStudentID: _commenterStudentID
            }).sendMentionNotification(mentions, feedback);
        }
        else {
            let _replyContent = req.body["replyContent"];
            let replyData = {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                feedbackContents: await replaceFeedbackText(_replyContent),
                parentFeedbackDocID: req.body["parentFeedbackDocID"],
            };
            let reply = await (0, feedbackService_js_1.addReply)(replyData);
            io.to(replyData.noteDocID).emit('add-reply', reply.toObject());
            if (_commenterStudentID !== reply["parentFeedbackDocID"]["commenterDocID"].studentID) {
                await (0, ioNotifcationService_js_1.NotificationSender)(io, {
                    noteDocID: _noteDocID,
                }).sendReplyNotification(reply);
            }
            let _mentions = (0, utils_js_1.checkMentions)(_replyContent);
            let mentions = _mentions[0] === reply["parentFeedbackDocID"]["commenterDocID"].username ? _mentions.slice(1) : _mentions;
            await (0, ioNotifcationService_js_1.NotificationSender)(io, {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                commenterStudentID: _commenterStudentID
            }).sendMentionNotification(mentions, reply);
        }
    });
    router.post('/:noteID/vote', async (req, res) => {
        const _noteDocID = req.params.noteID;
        const noteOwnerInfo = await (0, noteService_js_1.getOwner)({ noteDocID: _noteDocID });
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString();
        const action = req.query["action"];
        let voteType = req.query["type"];
        let noteDocID = req.body["noteDocID"];
        let _voterStudentID = req.body["voterStudentID"];
        let voterStudentDocID = (await userService_js_1.Convert.getDocumentID_studentid(_voterStudentID)).toString();
        try {
            if (!action) {
                let voteData = await (0, voteService_js_1.default)({ voteType, noteDocID, voterStudentDocID });
                let upvoteCount = voteData["noteDocID"]["upvoteCount"];
                io.emit('increment-upvote-dashboard', noteDocID);
                io.to(noteDocID).emit('increment-upvote');
                if (_voterStudentID !== _ownerStudentID) {
                    upvoteCount % 5 === 0 || upvoteCount === 1 ? (async function () {
                        await (0, ioNotifcationService_js_1.NotificationSender)(io, {
                            upvoteCount: upvoteCount,
                            noteDocID: noteDocID,
                            ownerStudentID: _ownerStudentID,
                            voterStudentDocID: voterStudentDocID
                        }).sendVoteNotification(voteData);
                    })() : false;
                }
                res.json({ ok: true });
            }
            else {
                await (0, voteService_js_1.deleteVote)({ noteDocID, voterStudentDocID, voteType });
                io.emit('decrement-upvote-dashboard', noteDocID);
                io.to(noteDocID).emit('decrement-upvote');
                res.json({ ok: true });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.get('/:noteID/shared', async (req, res, next) => {
        let headers = req.headers['user-agent'];
        let noteDocID = req.params.noteID;
        let note = (await (0, noteService_js_1.getNote)({ noteDocID })).note;
        if (headers.includes('facebook')) {
            res.render('shared', { note: note, req: req });
        }
        else {
            res.redirect(`/view/${noteDocID}`);
        }
    });
    return router;
}
exports.default = noteViewRouter;
