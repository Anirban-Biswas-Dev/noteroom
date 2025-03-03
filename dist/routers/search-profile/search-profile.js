"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rootInfo_js_1 = require("../../helpers/rootInfo.js");
const apis_js_1 = require("./apis.js");
const router = (0, express_1.Router)();
function serachProfileRouter(io) {
    router.use('/student', (0, apis_js_1.searchProfileApiRouter)(io));
    router.get('/', async (req, res, next) => {
        if (req.session["stdid"]) {
            try {
                let root = await (0, rootInfo_js_1.profileInfo)(req.session["stdid"]);
                let notis = await (0, rootInfo_js_1.getNotifications)(req.session["stdid"]);
                let unReadCount = await (0, rootInfo_js_1.unreadNotiCount)(req.session["stdid"]);
                res.render('search-profile', { root: root, notis: notis, unReadCount: unReadCount });
            }
            catch (error) {
                console.log(error);
                res.json({ students: [] });
            }
        }
        else {
            res.redirect('/login');
        }
    });
    return router;
}
exports.default = serachProfileRouter;
