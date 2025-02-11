"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLoggedIn = checkLoggedIn;
function checkLoggedIn(req, res, next) {
    if (req.session["stdid"]) {
        next();
    }
    else {
        res.redirect('/login');
    }
}
