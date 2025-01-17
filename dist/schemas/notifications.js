"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.votesNotifs = exports.replyNotifs = exports.mentionNotifs = exports.feedBackNotifs = exports.Notifs = void 0;
const mongoose_1 = require("mongoose");
const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'notifs'
};
const NotifsSchema = new mongoose_1.Schema({
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, baseOptions);
const NotifsModel = (0, mongoose_1.model)('notifs', NotifsSchema);
const feedBackSchema = new mongoose_1.Schema({
    noteDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    commenterDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    feedbackDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    ownerStudentID: String,
});
const feedBackNotifs = NotifsModel.discriminator('note-feedback', feedBackSchema);
const mentionSchema = new mongoose_1.Schema({
    noteDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    commenterDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    feedbackDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    mentionedStudentID: String,
});
const mentionNotifs = NotifsModel.discriminator('note-mention', mentionSchema);
const replySchema = new mongoose_1.Schema({
    noteDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    commenterDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'students',
        required: true,
    },
    parentFeedbackDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    feedbackDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    ownerStudentID: String,
});
const replyNotifs = NotifsModel.discriminator('note-reply', replySchema);
const voteSchema = new mongoose_1.Schema({
    noteDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'notes',
        required: true
    },
    voteDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'votes',
        required: true
    },
    voterDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'students',
        required: true
    },
    ownerStudentID: String
});
const votesNotifs = NotifsModel.discriminator('note-vote', voteSchema);
exports.Notifs = NotifsModel;
const _feedBackNotifs = feedBackNotifs;
exports.feedBackNotifs = _feedBackNotifs;
const _mentionNotifs = mentionNotifs;
exports.mentionNotifs = _mentionNotifs;
const _replyNotifs = replyNotifs;
exports.replyNotifs = _replyNotifs;
const _votesNotifs = votesNotifs;
exports.votesNotifs = _votesNotifs;
