"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const noteService_js_1 = require("../services/noteService.js");
const rootInfo_js_1 = require("../helpers/rootInfo.js");
const utils_js_1 = require("../helpers/utils.js");
const ioNotifcationService_js_1 = require("../services/io/ioNotifcationService.js");
const userService_js_1 = require("../services/userService.js");
const router = (0, express_1.Router)();
function uploadRouter(io) {
    async function handleNoteUploadFailure(noteDocId, studentID, noteTitle, studentDocID) {
        if (noteDocId) {
            await (0, noteService_js_1.deleteNote)({ studentDocID: studentDocID, noteDocID: noteDocId });
        }
        await (0, ioNotifcationService_js_1.NotificationSender)(io, {
            ownerStudentID: studentID
        }).sendNotification({
            content: `Your note '${noteTitle}' couldn't be uploaded successfully!`,
            event: 'notification-note-upload-failure'
        });
    }
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let student = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
            let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
            let notis = await (0, rootInfo_js_1.getNotifications)(req.session["stdid"]);
            let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
            res.render('upload-note', { root: student, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount });
            (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: redirected to upload.`);
        }
        else {
            res.redirect('/login');
        }
    });
    router.post('/', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"];
            let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(studentID)).toString();
            if (!req.files) {
                return res.send({ ok: false, kind: 404 });
            }
            let noteDocId;
            let noteTitle = req.body['noteTitle'] || "Note Title";
            try {
                let noteData = {
                    ownerDocID: studentDocID,
                    subject: req.body['noteSubject'],
                    title: req.body['noteTitle'],
                    description: req.body['noteDescription']
                };
                let note = await (0, noteService_js_1.addNote)(noteData);
                noteDocId = note._id;
                res.send({ ok: true });
                (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Primary notedata added and ok=true sent.`);
                (async function () {
                    try {
                        let allFilePaths = await (0, utils_js_1.processBulkCompressUpload)(req.files, studentDocID, noteDocId);
                        (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Bulk processing is completed of note images`);
                        await notes_js_1.default.findByIdAndUpdate(noteDocId, { $set: { content: allFilePaths, completed: true } });
                        (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Note images' list in added in the note document`);
                        let completedNoteData = await notes_js_1.default.findById(noteDocId);
                        await (0, ioNotifcationService_js_1.NotificationSender)(io, {
                            ownerStudentID: studentID,
                            redirectTo: `/view/${noteDocId}`
                        }).sendNotification({
                            content: `Your note '${completedNoteData["title"]}' is successfully uploaded!`,
                            event: 'notification-note-upload-success'
                        });
                        (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Note upload success notification sent`);
                        try {
                            let owner = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
                            io.emit('note-upload', {
                                noteData: {
                                    noteID: noteDocId,
                                    noteTitle: noteData.title,
                                    description: noteData.description,
                                    createdAt: note.createdAt,
                                },
                                contentData: {
                                    content1: allFilePaths[0],
                                    content2: allFilePaths[1],
                                    contentCount: allFilePaths.length,
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
                                    quickPost: false,
                                    pinned: false
                                }
                            });
                            (0, utils_js_1.log)('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: note-upload event is sent`);
                        }
                        catch (error) {
                            (0, utils_js_1.log)('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: note-upload event sent failure, abort: ${error.message}`);
                        }
                    }
                    catch (error) {
                        (0, utils_js_1.log)('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Error processing file upload. Primary data will be deleted: ${error.message}`);
                        handleNoteUploadFailure(noteDocId, studentID, noteTitle, studentDocID);
                        (0, utils_js_1.log)('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Note upload failure notification is sent`);
                    }
                })();
            }
            catch (error) {
                (0, utils_js_1.log)('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Error processing file upload. Primary data will be deleted: ${error.message}`);
                handleNoteUploadFailure(noteDocId, studentID, noteTitle, studentDocID);
                (0, utils_js_1.log)('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Note upload failure notification is sent`);
            }
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Error on note upload request processing: ${error.message}`);
            res.json({ ok: false, kind: 500 });
        }
    });
    return router;
}
exports.default = uploadRouter;
