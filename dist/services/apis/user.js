"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userApiRouter;
const express_1 = require("express");
const userService_1 = require("../userService");
const utils_1 = require("../../helpers/utils");
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
    return router;
}
