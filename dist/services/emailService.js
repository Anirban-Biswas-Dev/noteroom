"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = require("dotenv");
const posix_1 = require("path/posix");
(0, dotenv_1.config)({ path: (0, posix_1.join)(__dirname, '../.env') });
const appPassword = process.env.NOTEROOM_TEAM_APP_PASSWORD;
function sendMail(to, { subject, message }) {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'noteroom.team@gmail.com',
            pass: appPassword,
        }
    });
    const mailOptions = {
        to: to,
        subject: subject,
        html: message
    };
    let retured = true;
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            retured = false;
        }
        else {
            retured = true;
        }
    });
    return retured;
}
