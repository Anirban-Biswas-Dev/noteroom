"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProfileApiRouter = searchProfileApiRouter;
const express_1 = require("express");
const userService_1 = require("../../services/userService");
const router = (0, express_1.Router)();
function searchProfileApiRouter(io) {
    router.get('/random', async (req, res, next) => {
        try {
            let count = parseInt(req.query.count) || 5;
            let exclude = JSON.parse(req.query.exclude ? req.query.exclude : '[]');
            let students = await userService_1.SearchProfile.getRandomStudent(count, exclude);
            res.json(students);
        }
        catch (error) {
            res.json([]);
        }
    });
    router.get('/mutual-college', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"];
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(studentID)).toString();
            let profiles = await userService_1.SearchProfile.getMutualCollegeStudents(studentDocID);
            res.json(profiles);
        }
        catch (error) {
            res.json([]);
        }
    });
    return router;
}
