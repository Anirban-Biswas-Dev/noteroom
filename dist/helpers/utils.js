"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHash = getHash;
exports.checkMentions = checkMentions;
exports.replaceMentions = replaceMentions;
exports.generateRandomUsername = generateRandomUsername;
exports.compressImage = compressImage;
exports.setSession = setSession;
const slugify_1 = __importDefault(require("slugify"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
function getHash(input, salt = `${Math.random()}`) {
    const hash = crypto_1.default.createHash('sha256');
    hash.update(input + salt);
    return hash.digest('hex');
}
function checkMentions(feedbackText) {
    let mentions = /@[a-z0-9-]+-[a-z0-9]{8}/g;
    let answers = feedbackText.match(mentions);
    if (answers) {
        let mentionedUsers = answers.map(m => m.replace('@', ''));
        return mentionedUsers;
    }
    else {
        return [];
    }
}
function replaceMentions(feedbackText, displaynames) {
    let mentions = checkMentions(feedbackText).map(username => `@${username}`);
    let i = 0;
    mentions.map(mention => {
        feedbackText = feedbackText.replace(mention, `
            <a href="/user/${mention.replace(`@`, ``)}" style="color: #ffffff; background-color: #007bff; border-radius: 5px; padding: 2px 4px; font-weight: bold;">
                @${displaynames[i]}
            </a>`);
        i += 1;
    });
    return feedbackText;
}
function generateRandomUsername(displayname) {
    let sluggfied = (0, slugify_1.default)(displayname, {
        lower: true,
        strict: true
    });
    let uuid = (0, uuid_1.v4)();
    let suffix = uuid.split("-")[0];
    let username = `${sluggfied}-${suffix}`;
    return {
        userID: uuid,
        username: username
    };
}
async function compressImage(fileObject) {
    let imageBuffer = fileObject.data;
    let imageType = fileObject.mimetype === "image/jpeg" ? "jpeg" : "png";
    let compressedBuffer = await (0, sharp_1.default)(imageBuffer)[imageType](imageType === "png"
        ? { quality: 70, compressionLevel: 9, adaptiveFiltering: true }
        : { quality: 70, progressive: true }).toBuffer();
    let compressFileObject = Object.assign(fileObject, { buffer: compressedBuffer, size: compressedBuffer.length });
    return compressFileObject;
}
function setSession({ recordID, studentID }, req, res) {
    req["session"]["stdid"] = studentID;
    res["cookie"]('recordID', recordID, {
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    });
    res["cookie"]('studentID', studentID, {
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    });
}
