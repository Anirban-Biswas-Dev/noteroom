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
exports.processBulkCompressUpload = processBulkCompressUpload;
exports.setSession = setSession;
exports.log = log;
const slugify_1 = __importDefault(require("slugify"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const winston_1 = require("winston");
const firebaseService_1 = require("../services/firebaseService");
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
            <a href="/user/${mention.replace(`@`, ``)}" class="thread-mentioned-user">
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
    try {
        let imageBuffer = fileObject.data;
        let imageType = fileObject.mimetype === "image/jpeg" ? "jpeg" : "png";
        let compressedBuffer = await (0, sharp_1.default)(imageBuffer)[imageType](imageType === "png"
            ? { quality: 70, compressionLevel: 9, adaptiveFiltering: true }
            : { quality: 70, progressive: true }).toBuffer();
        log('info', `On compressImage fileName=${fileObject.name || "--filename--"}: Picture is compressed successfully.`);
        return { ...fileObject, buffer: compressedBuffer, size: compressedBuffer.length };
    }
    catch (error) {
        log('error', `On compressImage fileName=${fileObject.name || "--filename--"}: Picture compression failure. keeping it same: ${error.message}`);
        return fileObject;
    }
}
async function processBulkCompressUpload(files, studentDocID, noteDocID) {
    try {
        let fileObjects = Object.values(files);
        let compressedFiles = await Promise.all(fileObjects.map(fileObject => compressImage(fileObject)));
        let uploadedFiles = await Promise.all(compressedFiles.map(compressedFile => (0, firebaseService_1.upload)(compressedFile, `${studentDocID}/${noteDocID.toString()}/${compressedFile["name"]}`)));
        return uploadedFiles;
    }
    catch (error) {
        return [];
    }
}
function setSession({ recordID, studentID, username }, req, res) {
    req["session"]["stdid"] = studentID;
    res["cookie"]('recordID', recordID, {
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    });
    res["cookie"]('studentID', studentID, {
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    }),
        res["cookie"]('username', username, {
            secure: false,
            maxAge: 1000 * 60 * 60 * 720
        });
}
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.printf(({ timestamp, level, message }) => {
        return `${(new Date(String(timestamp))).toString()} [${level.toUpperCase()}]: ${message}`;
    })),
    transports: [
        new winston_1.transports.Console(),
    ],
});
async function log(level, message) {
    logger.log(level, message);
}
