"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const badgeSchema = new mongoose_1.Schema({
    badgeID: {
        type: Number,
        default: 0
    },
    badgeText: {
        type: String,
        default: "No Badge"
    },
    badgeLogo: {
        type: String,
        default: "no_badge.png"
    }
});
const badgeModel = (0, mongoose_1.model)('badges', badgeSchema);
exports.default = badgeModel;
