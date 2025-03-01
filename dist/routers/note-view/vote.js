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
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteRouter = voteRouter;
const express_1 = require("express");
const noteService_1 = require("../../services/noteService");
const ioNotifcationService_1 = require("../../services/io/ioNotifcationService");
const userService_1 = require("../../services/userService");
const voteService_1 = __importStar(require("../../services/voteService"));
const router = (0, express_1.Router)({ mergeParams: true });
function voteRouter(io) {
    router.post('/vote/feedback', async (req, res) => {
        let action = req.query["action"];
        let feedbackDocID = req.body["feedbackDocID"];
        let voteType = req.query["type"];
        let noteDocID = req.body["noteDocID"];
        let _voterStudentID = req.body["voterStudentID"];
        let voterStudentDocID = (await userService_1.Convert.getDocumentID_studentid(_voterStudentID)).toString();
        try {
            if (!action) {
                let voteData = await (0, voteService_1.addCommentVote)({ voteType, feedbackDocID, noteDocID, voterStudentDocID });
                if (voteData["saved"])
                    return { ok: false };
                let feedbackOwner = voteData["feedbackDocID"]["commenterDocID"];
                let upvoteCount = voteData["feedbackDocID"]["upvoteCount"];
                let isQuickPost = voteData["noteDocID"]["postType"] === 'quick-post';
                if (_voterStudentID !== feedbackOwner["studentID"]) {
                    let postTitle = (voteData["noteDocID"]["title"]?.slice(0, 20) || voteData["noteDocID"]["description"].slice(0, 20)) + '...';
                    upvoteCount === 1 || upvoteCount % 5 ? (async function () {
                        await (0, ioNotifcationService_1.NotificationSender)(io, {
                            ownerStudentID: feedbackOwner["studentID"],
                            redirectTo: isQuickPost ? `/view/quick-post/${noteDocID}` : `/view/${noteDocID}`
                        }).sendNotification({
                            content: `Your comment on "${postTitle}" got ${upvoteCount} like${upvoteCount === 1 ? '' : 's'}`,
                            event: 'notification-comment-upvote'
                        });
                    })() : false;
                }
                res.json({ ok: true });
            }
            else if (action === "delete") {
                let isDeleted = await (0, voteService_1.deleteCommentVote)({ feedbackDocID, voterStudentDocID });
                res.json({ ok: isDeleted.deleted || false });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.post('/vote', async (req, res) => {
        const _noteDocID = req.body["noteDocID"];
        const noteOwnerInfo = await (0, noteService_1.getOwner)({ noteDocID: _noteDocID });
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString();
        const action = req.query["action"];
        let voteType = req.query["type"];
        let noteDocID = req.body["noteDocID"];
        let _voterStudentID = req.body["voterStudentID"];
        let voterStudentDocID = (await userService_1.Convert.getDocumentID_studentid(_voterStudentID)).toString();
        try {
            if (!action) {
                let voteData = await (0, voteService_1.default)({ voteType, noteDocID, voterStudentDocID });
                if (voteData["saved"])
                    return { ok: false };
                let isQuickPost = voteData["noteDocID"]["postType"] === 'quick-post';
                let upvoteCount = voteData["noteDocID"]["upvoteCount"];
                io.emit('update-upvote-dashboard', noteDocID, upvoteCount);
                io.to(noteDocID).emit('update-upvote', upvoteCount);
                if (_voterStudentID !== _ownerStudentID) {
                    let postTitle = (voteData["noteDocID"]["title"]?.slice(0, 20) || voteData["noteDocID"]["description"].slice(0, 20)) + '...';
                    upvoteCount % 5 === 0 || upvoteCount === 1 ? (async function () {
                        await (0, ioNotifcationService_1.NotificationSender)(io, {
                            ownerStudentID: _ownerStudentID,
                            redirectTo: isQuickPost ? `/view/quick-post/${noteDocID}` : `/view/${noteDocID}`
                        }).sendNotification({
                            content: `Your post "${postTitle}" is making an impact! It just got ${upvoteCount} like${upvoteCount === 1 ? '' : 's'}.`,
                            event: 'notification-upvote'
                        });
                    })() : false;
                }
                res.json({ ok: true });
            }
            else {
                let upvoteCount = await (0, voteService_1.deleteVote)({ noteDocID, voterStudentDocID });
                io.emit('update-upvote-dashboard', noteDocID, upvoteCount);
                io.to(noteDocID).emit('update-upvote', upvoteCount);
                res.json({ ok: true });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    return router;
}
