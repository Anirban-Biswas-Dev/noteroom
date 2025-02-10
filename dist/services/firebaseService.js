"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNoteImages = exports.upload = void 0;
const path_1 = require("path");
const dotenv_1 = require("dotenv");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '../.env') });
const serviceAccount = JSON.parse(process.env.FIREBASE_CLOUD_CRED);
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(serviceAccount),
    storageBucket: "gs://noteroom-fb1a7.appspot.com"
});
let bucket = firebase_admin_1.default.storage().bucket();
async function uploadImage(fileObject, fileName) {
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
        metadata: {
            contentType: fileObject.mimetype,
        }
    });
    return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
            console.error('Error uploading file:', err);
            reject(err);
        });
        stream.on('finish', async () => {
            await file.makePublic();
            let publicUrl = `https://storage.googleapis.com/noteroom-fb1a7.appspot.com/${fileName}`;
            resolve(publicUrl);
        });
        stream.end(fileObject.buffer || fileObject.data);
    });
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
