"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const tokenSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true
    },
    reset_token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    expiresAt: {
        type: Date,
        default: new Date(Date.now() + 60 * 1000 * 60)
    }
});
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const tokensModel = (0, mongoose_1.model)('password_reset_tokens', tokenSchema);
exports.default = tokensModel;
