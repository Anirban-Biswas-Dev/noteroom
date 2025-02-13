"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const firebaseService_js_1 = require("../services/firebaseService.js");
const noteService_js_1 = require("../services/noteService.js");
const rootInfo_js_1 = require("../helpers/rootInfo.js");
const utils_js_1 = require("../helpers/utils.js");
const ioNotifcationService_js_1 = require("../services/io/ioNotifcationService.js");
const userService_js_1 = require("../services/userService.js");
const router = (0, express_1.Router)();
function uploadRouter(io) {
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let student = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
            let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
            let notis = await (0, rootInfo_js_1.getNotifications)(req.session["stdid"]);
            let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
            res.render('upload-note', { root: student, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount });
        }
        else {
            res.redirect('/login');
        }
    });
    router.post('/', async (req, res, next) => {
        let studentID = req.session["stdid"];
        let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(studentID)).toString();
        if (!req.files) {
            res.send({ ok: false, message: 'No files have been selected to publish' });
        }
        else {
            let noteDocId;
            let noteTitle = req.body['noteTitle'] || "Untitled Note";
            try {
                let noteData = {
                    ownerDocID: studentDocID,
                    subject: req.body['noteSubject'],
                    title: req.body['noteTitle'],
                    description: req.body['noteDescription']
                };
                (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Got note data with title=${noteData.title}.`);
                res.send({ ok: true });
                let note = await (0, noteService_js_1.addNote)(noteData);
                noteDocId = note._id;
                let fileObjects = Object.values(req.files);
                let compressedFileObjects = fileObjects.map(file => (0, utils_js_1.compressImage)(file));
                let allFiles = await Promise.all(compressedFileObjects);
                (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Processed note images of noteDocID=${noteDocId || '--notedocid--'}.`);
                let allFilePaths = [];
                for (const file of allFiles) {
                    let publicUrl = (await (0, firebaseService_js_1.upload)(file, `${studentDocID}/${noteDocId.toString()}/${file["name"]}`)).toString();
                    allFilePaths.push(publicUrl);
                }
                (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Uploaded note images of noteDocID=${noteDocId || '--notedocid--'}.`);
                await notes_js_1.default.findByIdAndUpdate(noteDocId, { $set: { content: allFilePaths, completed: true } });
                let completedNoteData = await notes_js_1.default.findById(noteDocId);
                (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Completed note upload of noteDocID=${noteDocId || '--notedocid--'}.`);
                await (0, ioNotifcationService_js_1.NotificationSender)(io, {
                    ownerStudentID: studentID,
                    redirectTo: `/view/${noteDocId}`
                }).sendNotification({
                    content: `Your note '${completedNoteData["title"]}' is successfully uploaded!`,
                    event: 'notification-note-upload-success'
                });
                let owner = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
                io.emit('note-upload', {
                    noteID: noteDocId,
                    noteTitle: noteData.title,
                    description: noteData.description,
                    createdAt: note.createdAt,
                    content1: allFilePaths[0],
                    content2: allFilePaths[1],
                    contentCount: allFilePaths.length,
                    ownerID: owner.studentID,
                    profile_pic: owner.profile_pic,
                    ownerDisplayName: owner.displayname,
                    ownerUserName: owner.username,
                    isSaved: false,
                    isUpvoted: false,
                    feedbackCount: 0,
                    upvoteCount: 0,
                    quickPost: false
                });
                (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Sent notification for successfull upload of noteDocID=${noteDocId || '--notedocid--'}.`);
            }
            catch (error) {
                (0, utils_js_1.log)('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Error on upload note of noteDocID=${noteDocId || '--notedocid--'}: ${error.message}.`);
                await (0, noteService_js_1.deleteNote)({ studentDocID: studentDocID, noteDocID: noteDocId });
                await (0, ioNotifcationService_js_1.NotificationSender)(io, {
                    ownerStudentID: studentID
                }).sendNotification({
                    content: `Your note '${noteTitle}' couldn't be uploaded successfully!`,
                    event: 'notification-note-upload-failure'
                });
            }
        }
    });
    return router;
}
exports.default = uploadRouter;
