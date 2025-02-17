"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNoteImages = exports.upload = void 0;
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const utils_js_1 = require("../helpers/utils.js");
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '../.env') });
const serviceAccount = JSON.parse(process.env.FIREBASE_CLOUD_CRED);
const bucketName = process.env.NOTEROOM_PRODUCTION_FIREBASE_BUCKET;
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    storageBucket: `gs://${bucketName}`
});
let bucket = firebase_admin_1.default.storage().bucket();
async function uploadImage(fileObject, fileName, options) {
    try {
        if (options && options.replaceWith) {
            const filePath = options.replaceWith.replace(`https://storage.googleapis.com/${bucketName}/`, '');
            await bucket.file(filePath).delete();
        }
        const file = bucket.file(fileName);
        await file.save(fileObject.buffer || fileObject.data, {
            metadata: { contentType: fileObject.mimetype }
        });
        await file.makePublic();
        let publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        (0, utils_js_1.log)('info', `On uploadImage fileName=${fileName || "--filename--"}: Picture is uploaded successfully.`);
        return publicUrl;
    }
    catch (error) {
        (0, utils_js_1.log)('error', `On uploadImage fileName=${fileName || "--filename--"}: Picture upload failure. Sending null: ${error.message}`);
        return null;
    }
}
async function deleteFolder({ studentDocID, noteDocID }, post = false, studentFolder = false) {
    if (!studentFolder) {
        let noteFolder = post ? `${studentDocID}/quick-posts/${noteDocID}` : `${studentDocID}/${noteDocID}`;
        let [files] = await bucket.getFiles({ prefix: noteFolder });
        if (files.length !== 0) {
            await Promise.all(files.map(file => file.delete()));
        }
    }
    else {
        let [files] = await bucket.getFiles({ prefix: studentDocID });
        if (files.length !== 0) {
            await Promise.all(files.map(file => file.delete()));
        }
    }
}
exports.upload = uploadImage;
exports.deleteNoteImages = deleteFolder;
