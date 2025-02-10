"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
exports.default = apiRouter;
const express_1 = require("express");
const path_1 = require("path");
const notes_js_1 = __importDefault(require("../../schemas/notes.js"));
const students_js_1 = __importDefault(require("../../schemas/students.js"));
const archiver_1 = __importDefault(require("archiver"));
const rootInfo_js_1 = require("../../helpers/rootInfo.js");
const noteService_js_1 = require("../noteService.js");
const userService_js_1 = require("../userService.js");
const note_js_1 = __importDefault(require("./note.js"));
const search_js_1 = __importDefault(require("./search.js"));
const request_js_1 = require("./request.js");
exports.router = (0, express_1.Router)();
function apiRouter(io) {
    exports.router.use('/note', (0, note_js_1.default)(io));
    exports.router.use('/search', (0, search_js_1.default)(io));
    exports.router.use('/request', (0, request_js_1.requestApi)(io));
    exports.router.get('/notifs', async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            let notifs = await (0, rootInfo_js_1.getNotifications)(studentID);
            res.json({ objects: notifs });
        }
        catch (error) {
            res.json({ objects: [] });
        }
    });
    exports.router.post("/download", async (req, res) => {
        let noteID = req.body.noteID;
        let noteTitle = req.body.noteTitle;
        const noteLinks = (await notes_js_1.default.findById(noteID, { content: 1 })).content;
        res.setHeader('Content-Type', 'application/zip');
        const sanitizeFilename = (filename) => {
            return filename.replace(/[^a-zA-Z0-9\.\-\_]/g, '_');
        };
        res.setHeader('Content-Disposition', `attachment; filename=${sanitizeFilename(noteTitle)}.zip`);
        const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
        archive.pipe(res);
        for (let imageUrl of noteLinks) {
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${imageUrl}: ${response.statusText}`);
                }
                let arrayBuffer = await response.arrayBuffer();
                let buffer = Buffer.from(arrayBuffer);
                let fileName = (0, path_1.basename)(new URL(imageUrl).pathname);
                archive.append(buffer, { name: fileName });
            }
            catch (err) {
                console.error(`Error fetching image: ${err.message}`);
                return;
            }
        }
        archive.finalize();
    });
    exports.router.get('/getnote', async (req, res, next) => {
        let type = req.query.type;
        async function getSavedNotes(studentDocID) {
            let student = await students_js_1.default.findById(studentDocID, { saved_notes: 1 });
            let saved_notes_ids = student['saved_notes'];
            let notes = await notes_js_1.default.aggregate([
                { $match: { _id: { $in: saved_notes_ids } } },
                { $project: {
                        title: 1,
                        thumbnail: { $first: '$content' }
                    } }
            ]);
            return notes;
        }
        if (type === 'save') {
            let studentDocID = await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"]);
            let savedNotes = await getSavedNotes(studentDocID);
            res.json(savedNotes);
        }
        else if (type === 'seg') {
            let page = req.query.page;
            let count = req.query.count;
            let skip = (page - 1) * count;
            let seed = req.query.seed;
            let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
            let notes = await (0, noteService_js_1.getAllNotes)(studentDocID, { skip: skip, limit: count, seed: seed });
            if (notes.length != 0) {
                res.json(notes);
            }
            else {
                res.json([]);
            }
        }
    });
    exports.router.get('/user/delete', async (req, res) => {
        try {
            let studentID = req.query["studentID"] || req.session["stdid"];
            let studentFolder = req.query["studentFolder"];
            let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(studentID)).toString();
            let response = await (0, userService_js_1.deleteAccount)(studentDocID, studentFolder === "true");
            let sessiondeletion = await (0, userService_js_1.deleteSessionsByStudentID)(studentID);
            console.log(`User got deleted`);
            res.json({ ok: response.ok && sessiondeletion.ok });
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    return exports.router;
}
