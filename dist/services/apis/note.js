"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = noteRouter;
const express_1 = require("express");
const userService_1 = require("../userService");
const noteService_1 = require("../noteService");
const noteService_2 = require("../noteService");
const notes_1 = __importDefault(require("../../schemas/notes"));
const router = (0, express_1.Router)();
function noteRouter(io) {
    router.get('/', async (req, res) => {
        try {
            let username = req.query["username"] || await userService_1.Convert.getUserName_studentid(req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d");
            let studentID = await userService_1.Convert.getStudentID_username(username);
            let noteType = req.query["noteType"];
            let isCount = req.query["count"] ? true : false;
            let isOwner = req.session["stdid"] === studentID;
            if (!isCount) {
                let notes = await noteService_2.manageProfileNotes.getNote(noteType, studentID);
                res.json({ objects: notes, isOwner });
            }
            else {
                let noteCount = await noteService_2.manageProfileNotes.getNoteCount(noteType, studentID);
                res.json({ noteType, count: noteCount });
            }
        }
        catch (error) {
            res.json({ objects: [] });
        }
    });
    router.get('/:noteID/metadata', async (req, res) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d";
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(studentID)).toString();
            let noteData = await (0, noteService_1.getNote)({ noteDocID: req.params.noteID, studentDocID });
            if (!noteData.error) {
                res.json({ ok: true, noteData });
            }
            else {
                res.json({ ok: false });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.get('/:noteID/images', async (req, res) => {
        try {
            let images = await (0, noteService_1.getNote)({ noteDocID: req.params.noteID, studentDocID: undefined }, true);
            if (!images.error) {
                res.json({ ok: true, images });
            }
            else {
                res.json({ ok: false });
            }
        }
        catch (error) {
            res.json({ ok: false });
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
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d")).toString();
            console.log([noteDocID, studentDocID, action]);
            if (action === 'save') {
                let result = await (0, noteService_1.addSaveNote)({ studentDocID, noteDocID });
                console.log(`saved`);
                res.json({ ok: result.ok, count: result.count, savedNote: result.savedNote });
            }
            else {
                let result = await (0, noteService_1.deleteSavedNote)({ studentDocID, noteDocID });
                console.log(`deleted`);
                res.json({ ok: result.ok, count: result.count });
            }
        }
        catch (error) {
            res.json({ ok: false, count: undefined });
        }
    });
    router.post('/pin', async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            if (studentID !== "0511f9b4-5282-450c-a3e5-220129585b8b") {
                res.json({ ok: false });
            }
            else {
                let noteDocID = req.body["noteID"];
                let changeTo = req.body["changeTo"] === "true" ? true : false;
                let updateResult = await notes_1.default.updateOne({ _id: noteDocID }, { pinned: changeTo });
                res.json({ ok: updateResult.modifiedCount !== 0 });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    return router;
}
