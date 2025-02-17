"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(err, req, res, next) {
    res.status(err.status || 500);
    if (err.status === 404) {
        res.render('404-error', { message: err.message });
    }
    else {
        res.render('500-error', { message: err.message });
    }
}
exports.default = errorHandler;
