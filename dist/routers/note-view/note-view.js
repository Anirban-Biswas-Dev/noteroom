"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rootInfo_js_1 = require("../../helpers/rootInfo.js");
const noteService_js_1 = require("../../services/noteService.js");
const userService_js_1 = require("../../services/userService.js");
const post_feedback_js_1 = require("./post-feedback.js");
const vote_js_1 = require("./vote.js");
const apis_js_1 = __importDefault(require("./apis.js"));
const quick_post_js_1 = require("./quick-post.js");
const router = (0, express_1.Router)();
function noteViewRouter(io) {
    router.use('/quick-post', (0, quick_post_js_1.quickPostRouter)(io));
    router.use('/:noteID', (0, post_feedback_js_1.postNoteFeedbackRouter)(io));
    router.use('/:noteID', (0, vote_js_1.voteRouter)(io));
    router.use('/:noteID', (0, apis_js_1.default)(io));
    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID;
            if (req.session["stdid"]) {
                let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
                if (noteDocID) {
                    let noteInformation = await (0, noteService_js_1.getNote)({ noteDocID, studentDocID });
                    if (noteInformation["error"] || noteInformation["note"]["postType"] === 'quick-post') {
                        next(new Error('Post not found!'));
                    }
                    else {
                        let [note, owner] = [noteInformation['note'], noteInformation['owner']];
                        let root = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
                        let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
                        let notis = await (0, rootInfo_js_1.getNotifications)(req.session["stdid"]);
                        let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
                        res.render('note-view/note-view', { postType: 'note', note: note, owner: owner, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount });
                    }
                }
            }
            else {
                res.redirect('/login');
            }
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/:noteID/shared', async (req, res, next) => {
        let headers = req.headers['user-agent'];
        let noteDocID = req.params.noteID;
        if (!headers.includes('facebook')) {
            res.redirect(`/view/${noteDocID}`);
        }
        else {
            let note = await (0, noteService_js_1.getNoteForShare)({ noteDocID });
            res.render('shared', { note: note, req: req });
        }
    });
    return router;
}
exports.default = noteViewRouter;
