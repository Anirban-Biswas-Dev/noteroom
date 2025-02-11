"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
let requestSchema = new mongoose_1.Schema({
    senderDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    receiverDocID: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'students'
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
let requestModel = (0, mongoose_1.model)('requests', requestSchema);
exports.default = requestModel;
