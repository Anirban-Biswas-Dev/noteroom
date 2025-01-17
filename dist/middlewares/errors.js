"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function errorHandler(err, req, res, next) {
    res.status(err.status || 500);
    if (err.errorID == 1000) {
        res.render('404-error', { message: `User with ID: ${req.studentID} not found` });
    }
    else {
        res.render('500-error', { message: err.message });
    }
}
exports.default = errorHandler;
