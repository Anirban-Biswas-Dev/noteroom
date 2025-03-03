"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = apisRouter;
const express_1 = require("express");
const noteService_1 = require("../../services/noteService");
const feedbackService_1 = require("../../services/feedbackService");
const userService_1 = require("../../services/userService");
const router = (0, express_1.Router)({ mergeParams: true });
function apisRouter(io) {
    router.get('/images', async (req, res) => {
        try {
            let noteDocID = req.params["noteID"];
            let images = await (0, noteService_1.getNote)({ noteDocID }, true);
            res.json(images);
        }
        catch (error) {
            res.json([]);
        }
    });
    router.get('/comments', async (req, res) => {
        let noteDocID = req.params["noteID"];
        let studentDocID = (await userService_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
        let feedbacks = await (0, feedbackService_1.getComments)({ noteDocID, studentDocID });
        res.json(feedbacks);
    });
    return router;
}
