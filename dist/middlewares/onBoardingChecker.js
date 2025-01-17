"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const students_js_1 = __importDefault(require("../schemas/students.js"));
function checkOnboarded(isOnBoardingFile) {
    async function middleware(req, res, next) {
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
            res.redirect("/login");
        }
    }
    return middleware;
}
exports.default = checkOnboarded;
