"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_js_1 = require("../services/userService.js");
const rootInfo_js_1 = require("../helpers/rootInfo.js");
const utils_js_1 = require("../helpers/utils.js");
const router = (0, express_1.Router)();
function userRouter(io) {
    router.get('/:username?', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"];
            if (!studentID)
                return res.redirect('/login');
            let rootUsername = await userService_js_1.Convert.getUserName_studentid(req.session["stdid"]);
            if (req.params.username) {
                let [notis, unReadCount, rootProfile, savedNotes] = await Promise.all([
                    (0, rootInfo_js_1.getNotifications)(req.session["stdid"]),
                    (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]),
                    (0, userService_js_1.getProfile)(req.session["stdid"]),
                    (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"])
                ]);
                (0, utils_js_1.log)('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Got root-user information`);
                let profileData = null;
                let isOwnProfile = rootUsername === req.params.username;
                if (isOwnProfile) {
                    profileData = rootProfile["_student"];
                    (0, utils_js_1.log)('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Visiting own profile`);
                }
                else {
                    let visitedStudentID = await userService_js_1.Convert.getStudentID_username(req.params.username);
                    if (!visitedStudentID) {
                        const error = new Error(`No students found for username: ${req.params.username}`);
                        error["status"] = 404;
                        (0, utils_js_1.log)('error', `On /user Username=${req.params.username || "--username--"}: Couldn't get user data: ${error.message}`);
                        return next(error);
                    }
                    profileData = (await (0, userService_js_1.getProfile)(visitedStudentID))["_student"];
                    (0, utils_js_1.log)('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Visiting ${visitedStudentID} profile`);
                }
                let { badges: badge, owned_notes: notes, ...student } = profileData;
                (0, utils_js_1.log)('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Prepared the profile information`);
                res.render('user-profile', {
                    student: student, notes: notes, badge: badge[0],
                    savedNotes: savedNotes, notis: notis, root: rootProfile["_student"], unReadCount: unReadCount,
                    visiting: !isOwnProfile
                });
                (0, utils_js_1.log)('info', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Rendered the profile successfully`);
            }
            else {
                res.redirect(`/user/${rootUsername}`);
            }
        }
        catch (err) {
            (0, utils_js_1.log)('error', `On /user StudentID=${req.session['stdid'] || "--studentid--"}: Error on user profile request processing: ${err.message}`);
            next(new Error("Sorry! Cannot get the user profile. Try again a bit later"));
        }
    });
    return router;
}
exports.default = userRouter;
