"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const votesSchema = new mongoose_1.Schema({
    noteDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "notes"
    },
    voterStudentDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "students"
    },
    voteType: {
        type: String,
        enum: ["upvote", "downvote"],
        default: "upvote"
    }
});
const votesModel = (0, mongoose_1.model)('votes', votesSchema);
exports.default = votesModel;
