"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyModel = exports.feedbacksModel = void 0;
const mongoose_1 = require("mongoose");
const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'comments'
};
const CommentsSchema = new mongoose_1.Schema({
    noteDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'notes'
    },
    feedbackContents: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, baseOptions);
const CommentsModel = (0, mongoose_1.model)('comments', CommentsSchema);
const feedbackSchema = new mongoose_1.Schema({
    commenterDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    replyCount: {
        type: Number,
        default: 0
    },
    upvoteCount: {
        type: Number,
        default: 0
    }
});
const feedbacksModel = CommentsModel.discriminator('feedbacks', feedbackSchema);
exports.feedbacksModel = feedbacksModel;
const replySchema = new mongoose_1.Schema({
    commenterDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    parentFeedbackDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'feedbacks'
    }
});
const replyModel = CommentsModel.discriminator('replies', replySchema);
exports.replyModel = replyModel;
exports.default = CommentsModel;
