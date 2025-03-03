"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToken = addToken;
exports.getToken = getToken;
exports.deleteToken = deleteToken;
const password_reset_tokens_js_1 = __importDefault(require("../schemas/password_reset_tokens.js"));
const students_js_1 = __importDefault(require("../schemas/students.js"));
async function addToken({ email, reset_token }) {
    try {
        let studentDoc = await students_js_1.default.findOne({ email: email });
        if (studentDoc) {
            await password_reset_tokens_js_1.default.create({ email, reset_token });
            return true;
        }
        return null;
    }
    catch (error) {
        return false;
    }
}
async function getToken(reset_token) {
    try {
        let token_document = await password_reset_tokens_js_1.default.findOne({ reset_token: reset_token }, { email: 1, reset_token: 1 });
        return token_document.toObject();
    }
    catch (error) {
        return false;
    }
}
async function deleteToken(reset_token) {
    try {
        await password_reset_tokens_js_1.default.deleteOne({ reset_token: reset_token });
        return true;
    }
    catch (error) {
        return false;
    }
}
