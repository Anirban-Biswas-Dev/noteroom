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
        try {
            if (!req.files) {
                res.send({ error: 'No files have been selected to publish' });
            }
            else {
                let noteData = {
                    ownerDocID: req.cookies['recordID'],
                    subject: req.body['noteSubject'],
                    title: req.body['noteTitle'],
                    description: req.body['noteDescription']
                };
                let note = await (0, noteService_js_1.addNote)(noteData);
                let noteDocId = note._id;
                let fileObjects = Object.values(req.files);
                let compressedFileObjects = fileObjects.map(file => (0, utils_js_1.compressImage)(file));
                let allFiles = await Promise.all(compressedFileObjects);
                let allFilePaths = [];
                for (const file of allFiles) {
                    let publicUrl = (await (0, firebaseService_js_1.upload)(file, `${req.cookies['recordID']}/${noteDocId.toString()}/${file["name"]}`)).toString();
                    allFilePaths.push(publicUrl);
                }
                notes_js_1.default.findByIdAndUpdate(noteDocId, { $set: { content: allFilePaths } }).then(() => {
                    res.send({ url: '/dashboard' });
                });
                let owner = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
                io.emit('note-upload', {
                    noteID: noteDocId,
                    thumbnail: allFilePaths[0],
                    profile_pic: owner.profile_pic,
                    noteTitle: noteData.title,
                    feedbackCount: 0,
                    ownerDisplayName: owner.displayname,
                    ownerID: owner.studentID,
                    ownerUserName: owner.username
                });
            }
        }
        catch (error) {
            if (error.errors && error.errors['title'] && error.errors.title['kind'] === 'maxlength') {
                let errorField = error.errors.title['path'];
                io.emit('note-validation', { errorField });
            }
            else {
                res.send({ error: error.message });
                next(error);
            }
        }
    });
    return router;
}
exports.default = uploadRouter;
