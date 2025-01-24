"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = apiRouter;
const express_1 = require("express");
const path_1 = require("path");
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const students_js_1 = __importDefault(require("../schemas/students.js"));
const archiver_1 = __importDefault(require("archiver"));
const rootInfo_js_1 = require("../helpers/rootInfo.js");
const noteService_js_1 = require("./noteService.js");
const userService_js_1 = require("./userService.js");
const checkLoggedIn_js_1 = require("../middlewares/checkLoggedIn.js");
const router = (0, express_1.Router)();
function apiRouter(io) {
    router.use(checkLoggedIn_js_1.checkLoggedIn);
    router.post("/download", async (req, res) => {
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
    router.delete("/note/delete/:noteDocID", async (req, res) => {
        let noteDocID = req.params.noteDocID;
        let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
        let deleted = await (0, noteService_js_1.deleteNote)({ studentDocID, noteDocID });
        res.send({ deleted: deleted });
    });
    router.post("/note/save", async (req, res) => {
        try {
            let action = req.query["action"];
            let noteDocID = req.body["noteDocID"];
            let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
            if (action === 'save') {
                let result = await (0, noteService_js_1.addSaveNote)({ studentDocID, noteDocID });
                res.json({ ok: result.ok, count: result.count });
            }
            else {
                let result = await (0, noteService_js_1.deleteSavedNote)({ studentDocID, noteDocID });
                res.json({ ok: result.ok, count: result.count });
            }
        }
        catch (error) {
            res.json({ ok: false, count: undefined });
        }
    });
    router.get('/search', async (req, res, next) => {
        let searchTerm = req.query.q;
        const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
        let notes = await notes_js_1.default.find({ title: { $regex: regex } }, { title: 1 });
        res.json(notes);
    });
    router.get('/searchUser', async (req, res) => {
        if (req.query) {
            let term = req.query.term;
            let students = await students_js_1.default.aggregate([
                {
                    $match: {
                        displayname: { $regex: `^${term}`, $options: 'i' }
                    }
                },
                {
                    $project: {
                        displayname: 1,
                        username: 1,
                        profile_pic: 1,
                        _id: 0
                    }
                }
            ]);
            res.json(students);
        }
    });
    router.get('/getnote', async (req, res, next) => {
        let type = req.query.type;
        async function getSavedNotes(studentDocID) {
            let student = await students_js_1.default.findById(studentDocID, { saved_notes: 1 });
            let saved_notes_ids = student['saved_notes'];
            let notes = await notes_js_1.default.find({ _id: { $in: saved_notes_ids } }, { title: 1 });
            return notes;
        }
        if (type === 'save') {
            let studentDocID = req.query.studentDocID;
            let savedNotes = await getSavedNotes(studentDocID);
            res.json(savedNotes);
        }
        else if (type === 'seg') {
            let page = req.query.page;
            let count = req.query.count;
            let skip = (page - 1) * count;
            let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
            let notes = await (0, noteService_js_1.getAllNotes)(studentDocID, { skip: skip, limit: count });
            if (notes.length != 0) {
                res.json(notes);
            }
            else {
                res.json([]);
            }
        }
    });
    router.get('/getNotifs', async (req, res) => {
        let studentID = req.query.studentID?.toString();
        let notifs = await (0, rootInfo_js_1.getNotifications)(studentID);
        res.json(notifs);
    });
    return router;
}
