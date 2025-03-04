"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userApiRouter;
const express_1 = require("express");
const userService_1 = require("../userService");
const utils_1 = require("../../helpers/utils");
const rootInfo_1 = require("../../helpers/rootInfo");
const router = (0, express_1.Router)();
function userApiRouter(io) {
    router.post('/profile/change', async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            let fieldName = req.body["fieldName"];
            let newValue = null;
            if (req.files) {
                newValue = await (0, utils_1.compressImage)(Object.values(req.files)[0]);
            }
            else {
                newValue = req.body["newValue"];
            }
            let result = await (0, userService_1.changeProfileDetails)(studentID, { fieldName, newValue });
            res.json({ ok: result });
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.get('/profile', async (req, res) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d";
            let profile = await (0, rootInfo_1.profileInfo)(studentID);
            res.json({ profile });
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    return router;
}
