"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const alertsSchema = new mongoose_1.Schema({
    message: {
        type: String,
        required: true
    },
    type: String,
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
});
const alertsModel = (0, mongoose_1.model)('alerts', alertsSchema);
exports.default = alertsModel;
