"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionNotifs = exports.Notifs = void 0;
const mongoose_1 = require("mongoose");
const baseOptions = {
    discriminatorKey: 'docType',
    collection: 'notifications'
};
const NotifsSchema = new mongoose_1.Schema({
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    content: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    notiType: {
        type: String
    },
    redirectTo: {
        type: String,
        default: ''
    },
    ownerStudentID: String
}, baseOptions);
const NotifsModel = (0, mongoose_1.model)('notifications', NotifsSchema);
exports.Notifs = NotifsModel;
const interactionNotifsSchema = new mongoose_1.Schema({
    fromUserSudentDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'students'
    }
});
const InteractionNotifsModel = NotifsModel.discriminator('interaction', interactionNotifsSchema);
exports.InteractionNotifs = InteractionNotifsModel;
