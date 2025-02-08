"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
function settingsRouter(io) {
    router.get('/', (req, res, next) => {
        if (req.session["stdid"]) {
            res.render('settings');
        }
        else {
            res.redirect('/login');
        }
    });
    return router;
}
exports.default = settingsRouter;
