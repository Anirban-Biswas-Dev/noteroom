"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alerts_js_1 = __importDefault(require("../schemas/alerts.js"));
const noteService_js_1 = require("../services/noteService.js");
const rootInfo_js_1 = require("../helpers/rootInfo.js");
const userService_js_1 = require("../services/userService.js");
const router = (0, express_1.Router)();
function dashboardRouter(io) {
    async function getAlert() {
        let alert = (await alerts_js_1.default.find({}).sort({ createdAt: -1 }))[0];
        return alert;
    }
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let alert = await getAlert();
            let root = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
            let notis = await (0, rootInfo_js_1.getNotifications)(req.session["stdid"]);
            let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
            let rootDocID = (await userService_js_1.Convert.getDocumentID_studentid(req.session["stdid"])).toString();
            let allNotes = await (0, noteService_js_1.getAllNotes)(rootDocID);
            let savedNotes = await (0, rootInfo_js_1.getSavedNotes)(req.session["stdid"]);
            res.render('dashboard/dashboard', { root: root, notis: notis, notes: allNotes, savedNotes: savedNotes, alert: alert, unReadCount: unReadCount });
        }
        else {
            res.redirect('login');
        }
    });
    return router;
}
exports.default = dashboardRouter;
