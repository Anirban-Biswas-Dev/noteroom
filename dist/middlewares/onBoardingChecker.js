"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const students_js_1 = __importDefault(require("../schemas/students.js"));
function checkOnboarded(isOnBoardingFile) {
    async function middleware(req, res, next) {
        try {
            if (req.session["stdid"]) {
                let student = await students_js_1.default.findOne({ studentID: req.session["stdid"] });
                if (student["collegeID"] === null) {
                    isOnBoardingFile ? res.render("onboarding") : res.redirect("/onboarding");
                }
                else {
                    next();
                }
            }
            else {
                let headers = req.headers['user-agent'];
                if (headers.includes('facebook')) {
                    next();
                }
                else {
                    res.redirect("/login");
                }
            }
        }
        catch (error) {
            res.redirect('/');
        }
    }
    return middleware;
}
exports.default = checkOnboarded;
