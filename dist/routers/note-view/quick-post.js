"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickPostRouter = quickPostRouter;
const express_1 = require("express");
const userService_1 = require("../../services/userService");
const noteService_1 = require("../../services/noteService");
const utils_1 = require("../../helpers/utils");
const firebaseService_1 = require("../../services/firebaseService");
const notes_1 = __importDefault(require("../../schemas/notes"));
const ioNotifcationService_1 = require("../../services/io/ioNotifcationService");
const rootInfo_1 = require("../../helpers/rootInfo");
const router = (0, express_1.Router)();
function quickPostRouter(io) {
    router.get('/:postID', async (req, res, next) => {
        try {
            let postID = req.params.postID;
            let ownerDocID = (await userService_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
            let postData = await (0, noteService_1.getNote)({ noteDocID: postID, studentDocID: ownerDocID });
            if (postData["error"] || postData["note"]["postType"] === 'note') {
                next(new Error('Post not found!'));
            }
            else {
                let [post, owner] = [postData["note"], postData["owner"]];
                let root = await (0, rootInfo_1.profileInfo)(req.session["stdid"]);
                let savedNotes = await (0, rootInfo_1.getSavedNotes)(req.session["stdid"]);
                let notis = await (0, rootInfo_1.getNotifications)(req.session["stdid"]);
                let unReadCount = await (0, rootInfo_1.unreadNotiCount)(req.session["stdid"]);
                res.render('note-view/note-view', { postType: 'quick-post', note: post, owner: owner, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount });
            }
        }
        catch (error) {
            next(error);
        }
    });
    router.post('/', async (req, res) => {
        let notificationTitle = req.body["text"] ? `${req.body["text"].slice(0, 20)}...` : 'Untitled Post';
        "Untitled Post";
        let ownerDocID = (await userService_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
        let postID;
        try {
            let postText = req.body["text"];
            let file = [];
            let finalPost;
            let postData = {
                ownerDocID: ownerDocID,
                description: postText,
                content: file,
                postType: 'quick-post'
            };
            res.json({ ok: true });
            let contentCount = 0;
            let content = null;
            finalPost = await (0, noteService_1.addQuickPost)(postData);
            postID = finalPost["_id"].toString();
            if (req.files) {
                let fileObject = Object.values(req.files)[0];
                let compressedImage = await (0, utils_1.compressImage)(fileObject);
                let publicUrl = (await (0, firebaseService_1.upload)(compressedImage, `${ownerDocID}/quick-posts/${finalPost._id.toString()}/${fileObject.name}`)).toString();
                file.push(publicUrl);
                contentCount = 1;
                content = publicUrl;
                await notes_1.default.updateOne({ _id: finalPost._id }, { $set: { content: file, completed: true } });
            }
            await notes_1.default.updateOne({ _id: finalPost._id }, { $set: { completed: true } });
            await (0, ioNotifcationService_1.NotificationSender)(io, {
                ownerStudentID: req.session["stdid"],
                redirectTo: `/view/quick-post/${postID}`
            }).sendNotification({
                content: `Your quick-post '${notificationTitle}' uploaded successfully!`,
                event: 'notification-note-upload-success'
            });
            let owner = await (0, rootInfo_1.profileInfo)(req.session["stdid"]);
            io.emit('note-upload', {
                noteData: {
                    noteID: postID,
                    noteTitle: null,
                    description: postData.description,
                    createdAt: finalPost.createdAt,
                },
                contentData: {
                    content1: content,
                    content2: null,
                    contentCount: contentCount,
                },
                ownerData: {
                    ownerID: owner.studentID,
                    profile_pic: owner.profile_pic,
                    ownerDisplayName: owner.displayname,
                    ownerUserName: owner.username,
                },
                interactionData: {
                    isSaved: false,
                    isUpvoted: false,
                    feedbackCount: 0,
                    upvoteCount: 0,
                },
                extras: {
                    quickPost: true,
                    pinned: false
                }
            });
        }
        catch (error) {
            await (0, noteService_1.deleteNote)({ noteDocID: postID, studentDocID: ownerDocID }, true);
            await (0, ioNotifcationService_1.NotificationSender)(io, {
                ownerStudentID: req.session["stdid"],
            }).sendNotification({
                content: `Your quick-post '${notificationTitle}' couldn't be uploaded!`,
                event: 'notification-note-upload-failure'
            });
        }
    });
    return router;
}
