"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentVotes = void 0;
const mongoose_1 = require("mongoose");
const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'votes'
};
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
}, baseOptions);
const votesModel = (0, mongoose_1.model)('votes', votesSchema);
const commenteVotesSchema = new mongoose_1.Schema({
    feedbackDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'comments'
    }
});
const commentVotesModel = votesModel.discriminator('feedback', commenteVotesSchema);
exports.default = votesModel;
exports.CommentVotes = commentVotesModel;
