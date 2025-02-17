"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailService_js_1 = __importDefault(require("../services/emailService.js"));
const utils_js_1 = require("../helpers/utils.js");
const resetTokenService_js_1 = require("../services/resetTokenService.js");
const userService_js_1 = require("../services/userService.js");
const emailTemplates_js_1 = require("../helpers/emailTemplates.js");
const router = (0, express_1.Router)();
function resetPasswordRouter() {
    router.get('/password-reset', async (req, res) => {
        let reset_token = req.query["token"];
        if (reset_token) {
            let reset_token_data = await (0, resetTokenService_js_1.getToken)(reset_token);
            let is_valid_token = reset_token_data ? true : false;
            if (is_valid_token) {
                res.render('reset-password', { accepted: true });
            }
            else {
                res.render('reset-password', { accepted: false });
            }
        }
        else {
            res.render('reset-password', { accepted: null });
        }
    });
    router.post('/password-reset', async (req, res) => {
        try {
            let email = req.body["email"];
            let reset_token = (0, utils_js_1.getHash)(email);
            let tokenAdded = await (0, resetTokenService_js_1.addToken)({ email: email, reset_token: reset_token });
            if (tokenAdded) {
                let displayname = await userService_js_1.Convert.getDisplayName_email(email);
                let response = (0, emailService_js_1.default)(email, {
                    subject: "Reset Your NoteRoom Password",
                    message: emailTemplates_js_1.templates.reset_password({ reset_token: reset_token, displayname: displayname })
                });
                res.json({ sent: response });
            }
            else if (tokenAdded === null) {
                res.json({ sent: true });
            }
            else {
                res.json({ sent: false });
            }
        }
        catch (error) {
            res.json({ sent: false });
        }
    });
    router.get('/password-change', async (req, res) => {
        if (req.session["stdid"]) {
            res.render('change-password');
        }
        else {
            res.redirect('/login');
        }
    });
    router.post('/password-change', async (req, res) => {
        let action = req.query["action"];
        if (action === "reset") {
            let reset_token = req.body["reset_token"];
            let new_password = req.body["password"];
            let reset_token_data = await (0, resetTokenService_js_1.getToken)(reset_token);
            let is_valid_token = reset_token_data ? true : false;
            if (is_valid_token) {
                let response = await (0, userService_js_1.changePassword)(reset_token_data["email"], new_password);
                if (response) {
                    await (0, resetTokenService_js_1.deleteToken)(reset_token);
                    let studentID = await userService_js_1.Convert.getStudentID_email(reset_token_data["email"]);
                    await (0, userService_js_1.deleteSessionsByStudentID)(studentID);
                    res.json({ changed: true });
                }
                else {
                    res.json({ changed: false });
                }
            }
            else {
                res.json({ changed: false });
            }
        }
        else if (action === "change") {
            if (req.session["stdid"]) {
                let current_password = req.body["current_password"];
                let new_password = req.body["new_password"];
                let studentID = req.session["stdid"];
                let email = await userService_js_1.Convert.getEmail_studentid(studentID);
                let changed = await (0, userService_js_1.changePassword)(email, new_password, current_password);
                res.json({ changed: changed });
            }
            else {
                res.redirect('/login');
            }
        }
    });
    return router;
}
exports.default = resetPasswordRouter;
