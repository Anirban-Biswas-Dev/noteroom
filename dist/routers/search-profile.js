"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_js_1 = require("../services/userService.js");
const rootInfo_js_1 = require("../helpers/rootInfo.js");
const router = (0, express_1.Router)();
function serachProfileRouter(io) {
    router.get('/', async (req, res, next) => {
        if (req.session["stdid"]) {
            try {
                let searchTerm = req.query.q?.toString();
                if (searchTerm) {
                    let students = await userService_js_1.SearchProfile.getStudent(searchTerm);
                    res.json({ students });
                }
                else {
                    let students = await userService_js_1.SearchProfile.getRandomStudent(3);
                    let root = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
                    let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
                    let notis = await (0, rootInfo_js_1.getNotifications)(req.session["stdid"]);
                    let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
                    res.render('search-profile', { students: students, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount });
                }
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        }
        else {
            res.redirect('/login');
        }
    });
    return router;
}
exports.default = serachProfileRouter;
