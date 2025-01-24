"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rootInfo_js_1 = require("../../helpers/rootInfo.js");
const noteService_js_1 = require("../../services/noteService.js");
const userService_js_1 = require("../../services/userService.js");
const post_feedback_js_1 = require("./post-feedback.js");
const vote_js_1 = require("./vote.js");
const router = (0, express_1.Router)();
function noteViewRouter(io) {
    router.use('/:noteID', (0, post_feedback_js_1.postNoteFeedbackRouter)(io));
    router.use('/:noteID', (0, vote_js_1.voteRouter)(io));
    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID;
            let mynote;
            if (req.session["stdid"]) {
                let studentDocID = (await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
                if (noteDocID) {
                    let noteInformation = await (0, noteService_js_1.getNote)({ noteDocID, studentDocID });
                    let [note, owner, feedbacks] = [noteInformation['note'], noteInformation['owner'], noteInformation['feedbacks']];
                    let root = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
                    let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
                    let notis = await (0, rootInfo_js_1.getNotifications)(req.session["stdid"]);
                    let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
                    if (note.ownerDocID == req.cookies['recordID']) {
                        mynote = 1;
                        res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount });
                    }
                    else {
                        mynote = 0;
                        res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount });
                    }
                }
            }
            else {
                mynote = 3;
                let noteInformation = await (0, noteService_js_1.getNote)({ noteDocID });
                let [note, owner, feedbacks] = [noteInformation['note'], noteInformation['owner'], noteInformation['feedbacks']];
                res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: owner });
            }
        }
        catch (error) {
            next(error);
        }
    });
    router.get('/:noteID/shared', async (req, res, next) => {
        let headers = req.headers['user-agent'];
        let noteDocID = req.params.noteID;
        let note = (await (0, noteService_js_1.getNote)({ noteDocID })).note;
        if (headers.includes('facebook')) {
            res.render('shared', { note: note, req: req });
        }
        else {
            res.redirect(`/view/${noteDocID}`);
        }
    });
    return router;
}
exports.default = noteViewRouter;
