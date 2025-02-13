"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_js_1 = require("../services/userService.js");
const googleAuth_js_1 = require("../services/googleAuth.js");
const utils_js_1 = require("../helpers/utils.js");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const process = __importStar(require("node:process"));
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '../.env') });
const router = (0, express_1.Router)();
const client_id = process.env.GOOGLE_CLIENT_ID;
function loginRouter(io) {
    router.get('/', (req, res) => {
        try {
            if (req.session["stdid"]) {
                res.redirect('dashboard');
                (0, utils_js_1.log)('info', `On /login StudentID=${req.session['stdid']} redirected to dashboard.`);
            }
            else {
                res.status(200);
                res.render('login');
                (0, utils_js_1.log)('info', `On /login StudentID=${req.session['stdid'] || "--studentid--"} redirected to login.`);
            }
        }
        catch (error) {
            (0, utils_js_1.log)('error', `On /login StudentID=${req.session["stdid"] || "--studentid--"}: ${error.message}`);
        }
    });
    router.post('/auth/google', async (req, res) => {
        try {
            let { id_token } = req.body;
            let userData = await (0, googleAuth_js_1.verifyToken)(client_id, id_token);
            let email = userData.email;
            let user = await userService_js_1.LogIn.getProfile(email);
            if (user["authProvider"] !== null) {
                (0, utils_js_1.setSession)({ recordID: user['recordID'], studentID: user["studentID"], username: user["username"] }, req, res);
                res.send({ redirect: '/dashboard' });
            }
            else {
                res.json({ message: 'Sorry! No student account is associated with that email account' });
            }
        }
        catch (error) {
            res.json({ message: error });
        }
    });
    router.post('/', async (req, res) => {
        try {
            let email = req.body.email;
            let password = req.body.password;
            if (!(email && password)) {
                res.json({ ok: false, field: email === "" ? "email" : "password" });
            }
            else {
                let student = await userService_js_1.LogIn.getProfile(email);
                if (student["authProvider"] === null) {
                    if (password === student['studentPass']) {
                        (0, utils_js_1.setSession)({ recordID: student['recordID'], studentID: student["studentID"], username: student["username"] }, req, res);
                        res.json({ ok: true, url: '/dashboard' });
                    }
                    else {
                        io.emit('wrong-cred');
                    }
                }
                else {
                    io.emit('wrong-cred');
                }
            }
        }
        catch (error) {
            io.emit('no-email');
        }
    });
    return router;
}
exports.default = loginRouter;
