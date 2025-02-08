"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_js_1 = require("../services/userService.js");
const rootInfo_js_1 = require("../helpers/rootInfo.js");
const noteService_js_1 = require("../services/noteService.js");
const router = (0, express_1.Router)();
function userRouter(io) {
    router.get('/:username?', async (req, res, next) => {
        if (req.params.username) {
            if (req.session["stdid"]) {
                let username = await userService_js_1.Convert.getUserName_studentid(req.session["stdid"]);
                let notis = await (0, rootInfo_js_1.getNotifications)(req.session["stdid"]);
                let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
                let noteCounts = [
                    await noteService_js_1.manageProfileNotes.getNoteCount('owned', req.session["stdid"]),
                    await noteService_js_1.manageProfileNotes.getNoteCount('saved', req.session["stdid"])
                ];
                if (username == req.params.username) {
                    try {
                        let data = await (0, userService_js_1.getProfile)(req.session["stdid"]);
                        let [student, notes] = [data['student'], data['notes']];
                        let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
                        res.render('user-profile', { noteCounts: noteCounts, student: student, notes: notes, savedNotes: savedNotes, visiting: false, notis: notis, root: student, unReadCount: unReadCount });
                    }
                    catch (error) {
                        next(error);
                    }
                }
                else {
                    try {
                        let userStudentID = await userService_js_1.Convert.getStudentID_username(req.params.username);
                        let data = await (0, userService_js_1.getProfile)(userStudentID);
                        let [student, notes] = [data['student'], data['notes']];
                        let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
                        let root = (await (0, userService_js_1.getProfile)(req.session["stdid"]))['student'];
                        res.render('user-profile', { student: student, notes: notes, savedNotes: savedNotes, visiting: true, notis: notis, root: root, unReadCount: unReadCount });
                    }
                    catch (err) {
                        req["studentID"] = req.params.username;
                        const error = new Error('No students found');
                        error["status"] = 404;
                        error["errorID"] = 1000;
                        next(error);
                    }
                }
            }
            else {
                res.redirect('/login');
            }
        }
        else {
            if (req.session["stdid"]) {
                let username = await userService_js_1.Convert.getUserName_studentid(req.session["stdid"]);
                res.redirect(`/user/${username}`);
            }
            else {
                res.redirect('/login');
            }
        }
    });
    return router;
}
exports.default = userRouter;
