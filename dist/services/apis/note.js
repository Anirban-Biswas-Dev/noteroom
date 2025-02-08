"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = noteRouter;
const express_1 = require("express");
const userService_1 = require("../userService");
const noteService_1 = require("../noteService");
const noteService_2 = require("../noteService");
const router = (0, express_1.Router)();
function noteRouter(io) {
    router.get('/', async (req, res) => {
        try {
            let username = req.query["username"] || await userService_1.Convert.getUserName_studentid(req.session["stdid"]);
            let studentID = await userService_1.Convert.getStudentID_username(username);
            let noteType = req.query["noteType"];
            let isCount = req.query["count"] ? true : false;
            if (!isCount) {
                let notes = await noteService_2.manageProfileNotes.getNote(noteType, studentID);
                res.json(notes);
            }
            else {
                let noteCount = await noteService_2.manageProfileNotes.getNoteCount(noteType, studentID);
                res.json({ noteType, count: noteCount });
            }
        }
        catch (error) {
            res.json([]);
        }
    });
    router.delete("/delete/:noteDocID", async (req, res) => {
        let noteDocID = req.params.noteDocID;
        let studentDocID = (await userService_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
        let deleted = await (0, noteService_1.deleteNote)({ studentDocID, noteDocID });
        res.send({ deleted: deleted });
    });
    router.post("/save", async (req, res) => {
        try {
            let action = req.query["action"];
            let noteDocID = req.body["noteDocID"];
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
            if (action === 'save') {
                let result = await (0, noteService_1.addSaveNote)({ studentDocID, noteDocID });
                res.json({ ok: result.ok, count: result.count, savedNote: result.savedNote });
            }
            else {
                let result = await (0, noteService_1.deleteSavedNote)({ studentDocID, noteDocID });
                res.json({ ok: result.ok, count: result.count });
            }
        }
        catch (error) {
            res.json({ ok: false, count: undefined });
        }
    });
    return router;
}
