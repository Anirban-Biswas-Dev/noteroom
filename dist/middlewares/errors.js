"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../helpers/utils");
function errorHandler(err, req, res, next) {
    res.status(err.status || 500);
    (0, utils_1.log)('error', `On error username=${req.studentID || "--username--"}: ${err.message}`);
    if (err.errorID == 1000) {
        res.render('404-error', { message: `User with username: ${req.studentID} not found` });
    }
    else {
        res.render('500-error', { message: err.message });
    }
}
exports.default = errorHandler;
