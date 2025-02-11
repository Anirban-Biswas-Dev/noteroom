"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = searchRouter;
const express_1 = require("express");
const notes_js_1 = __importDefault(require("../../schemas/notes.js"));
const userService_js_1 = require("../userService.js");
const router = (0, express_1.Router)();
function searchRouter(io) {
    router.get('/note', async (req, res, next) => {
        try {
            let searchTerm = req.query.q;
            const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
            let notes = await notes_js_1.default.find({ title: { $regex: regex }, type_: { $ne: "private" } }, { title: 1 });
            res.json(notes);
        }
        catch (error) {
            res.json([]);
        }
    });
    router.get('/user', async (req, res, next) => {
        try {
            if (req.query) {
                let term = req.query.term;
                let students = await userService_js_1.SearchProfile.getStudent(term);
                res.json(students);
            }
        }
        catch (error) {
            res.json([]);
        }
    });
    return router;
}
