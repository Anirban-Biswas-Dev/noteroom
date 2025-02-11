"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rootInfo_js_1 = require("../helpers/rootInfo.js");
const router = (0, express_1.Router)();
function dashboardRouter(io) {
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let admin = false;
            if (req.session["stdid"] === "0511f9b4-5282-450c-a3e5-220129585b8b") {
                admin = true;
            }
            let root = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
            let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
            let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
            res.render('dashboard/dashboard', { root: root, savedNotes: savedNotes, unReadCount: unReadCount, admin: admin });
        }
        else {
            res.redirect('login');
        }
    });
    return router;
}
exports.default = dashboardRouter;
