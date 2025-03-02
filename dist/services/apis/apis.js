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
const archiver_1 = __importDefault(require("archiver"));
const rootInfo_js_1 = require("../../helpers/rootInfo.js");
const noteService_js_1 = require("../noteService.js");
const userService_js_1 = require("../userService.js");
const note_js_1 = __importDefault(require("./note.js"));
const search_js_1 = __importDefault(require("./search.js"));
const request_js_1 = require("./request.js");
const user_js_1 = __importDefault(require("./user.js"));
const utils_js_1 = require("../../helpers/utils.js");
exports.router = (0, express_1.Router)();
function apiRouter(io) {
    exports.router.use('/note', (0, note_js_1.default)(io));
    exports.router.use('/search', (0, search_js_1.default)(io));
    exports.router.use('/request', (0, request_js_1.requestApi)(io));
    exports.router.use('/user', (0, user_js_1.default)(io));
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
        try {
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
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${imageUrl}: ${response.statusText}`);
                }
                let arrayBuffer = await response.arrayBuffer();
                let buffer = Buffer.from(arrayBuffer);
                let fileName = (0, path_1.basename)(new URL(imageUrl).pathname);
                archive.append(buffer, { name: fileName });
            }
            archive.finalize();
            (0, utils_js_1.log)('info', `On /download StudentID=${req.session["stdid"] || "--studentid--"}: Downloaded note ${req.body.noteID || '--noteid--'}`);
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On /download StudentID=${req.session["stdid"] || "--studentid--"}: Couldn't download note ${req.body.noteID || '--noteid--'}`);
            res.json({ ok: false });
        }
    });
    exports.router.get('/getnote', async (req, res, next) => {
        try {
            const count = 7;
            let page = Number(req.query.page) || 1;
            let seed = Number(req.query.seed) || 601914080;
            let skip = (page - 1) * count;
            let after = req.query.after ? String(req.query.after) : undefined;
            let _studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"]));
            let studentDocID;
            if (_studentDocID) {
                studentDocID = _studentDocID.toString();
                (0, utils_js_1.log)('info', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: Converted studentID->documentID`);
                let notes = await (0, noteService_js_1.getAllNotes)(studentDocID, { skip: skip, limit: count, seed: seed, after: after });
                (0, utils_js_1.log)('info', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: Got notes with skip=${skip}, limit=${count}, seed=${seed}`);
                if (notes.length != 0) {
                    (0, utils_js_1.log)('info', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: Sent notes with skip=${skip}, limit=${count}, seed=${seed}`);
                    res.json(notes);
                }
                else {
                    (0, utils_js_1.log)('info', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: No notes left`);
                    res.json([]);
                }
            }
            else {
                (0, utils_js_1.log)('error', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: Conversion studentID->documentID failed`);
                res.json([]);
            }
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: ${error.message}`);
            res.json([]);
        }
    });
    exports.router.get('/user/delete', async (req, res) => {
        try {
            let studentID = req.query["studentID"] || req.session["stdid"];
            let studentFolder = req.query["studentFolder"];
            let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(studentID)).toString();
            let response = await (0, userService_js_1.deleteAccount)(studentDocID, studentFolder === "true");
            let sessiondeletion = await (0, userService_js_1.deleteSessionsByStudentID)(studentID);
            (0, utils_js_1.log)('info', `On /user/delete StudentID=${studentID || "--studentid--"}: User is deleted`);
            res.json({ ok: response.ok && sessiondeletion.ok });
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    exports.router.delete('/notifications/delete', async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            let deletedResult = await (0, notificationService_js_1.deleteAllNoti)(studentID);
            res.json({ ok: deletedResult });
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    return exports.router;
}
