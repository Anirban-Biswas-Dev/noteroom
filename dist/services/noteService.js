"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNote = addNote;
exports.deleteNote = deleteNote;
exports.addSaveNote = addSaveNote;
exports.deleteSavedNote = deleteSavedNote;
exports.getNote = getNote;
exports.getAllNotes = getAllNotes;
exports.getOwner = getOwner;
exports.isSaved = isSaved;
const students_js_1 = __importDefault(require("../schemas/students.js"));
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const comments_js_1 = __importStar(require("../schemas/comments.js"));
const notifications_js_1 = require("../schemas/notifications.js");
const firebaseService_js_1 = require("./firebaseService.js");
const voteService_js_1 = require("./voteService.js");
async function addNote(noteData) {
    let note = await notes_js_1.default.create(noteData);
    await students_js_1.default.findByIdAndUpdate(noteData.ownerDocID, { $push: { owned_notes: note._id } }, { upsert: true, new: true });
    return note;
}
async function deleteNote({ studentDocID, noteDocID }) {
    try {
        await notes_js_1.default.deleteOne({ _id: noteDocID });
        await students_js_1.default.updateOne({ _id: studentDocID }, { $pull: { owned_notes: noteDocID } });
        await comments_js_1.default.deleteMany({ _id: noteDocID });
        let noteNotifs = await notifications_js_1.Notifs.find({ docType: { $in: ["note-feedback", "note-reply", "note-mention"] } });
        let noteSpecificNotifsDocIDs = noteNotifs.filter(noti => noti["noteDocID"].toString() === noteDocID).map(noti => noti["_id"]);
        await notifications_js_1.Notifs.deleteMany({ _id: { $in: noteSpecificNotifsDocIDs } });
        await (0, firebaseService_js_1.deleteNoteImages)({ studentDocID, noteDocID });
        return true;
    }
    catch (error) {
        return false;
    }
}
async function addSaveNote({ studentDocID, noteDocID }) {
    try {
        await students_js_1.default.updateOne({ _id: studentDocID }, { $addToSet: { saved_notes: noteDocID } }, { new: true });
        let saved_notes_count = (await students_js_1.default.findOne({ _id: studentDocID }, { saved_notes: 1 })).saved_notes.length;
        return { ok: true, count: saved_notes_count };
    }
    catch (error) {
        return { ok: false };
    }
}
async function deleteSavedNote({ studentDocID, noteDocID }) {
    try {
        await students_js_1.default.updateOne({ _id: studentDocID }, { $pull: { saved_notes: noteDocID } });
        let saved_notes_count = (await students_js_1.default.findOne({ _id: studentDocID }, { saved_notes: 1 })).saved_notes.length;
        return { ok: true, count: saved_notes_count };
    }
    catch (error) {
        return { ok: false };
    }
}
async function getNote({ noteDocID, studentDocID }) {
    if (noteDocID) {
        let _note = (await notes_js_1.default.findById(noteDocID, { title: 1, subject: 1, description: 1, ownerDocID: 1, content: 1, upvoteCount: 1 })).toObject();
        let _isNoteUpvoted = await (0, voteService_js_1.isUpVoted)({ noteDocID, voterStudentDocID: studentDocID });
        let _isSaved = await isSaved({ studentDocID, noteDocID });
        let note = { ..._note, isUpvoted: _isNoteUpvoted, isSaved: _isSaved };
        let owner = await students_js_1.default.findById(note.ownerDocID, { displayname: 1, studentID: 1, profile_pic: 1, username: 1 });
        let feedbacks = await comments_js_1.feedbacksModel.find({ noteDocID: note._id })
            .populate('commenterDocID', 'displayname username studentID profile_pic').sort({ createdAt: -1 });
        let _extentedFeedbacks = feedbacks.map(async (feedback) => {
            let isupvoted = await (0, voteService_js_1.isCommentUpVoted)({ feedbackDocID: feedback._id.toString(), voterStudentDocID: studentDocID });
            let reply = await comments_js_1.replyModel.find({ parentFeedbackDocID: feedback._id })
                .populate('commenterDocID', 'username displayname profile_pic studentID');
            return [{ ...feedback.toObject(), isUpVoted: isupvoted }, reply];
        });
        let extendedFeedbacks = await Promise.all(_extentedFeedbacks);
        let returnedNote = { note: note, owner: owner, feedbacks: extendedFeedbacks };
        return returnedNote;
    }
}
async function getAllNotes(studentDocID, options = { skip: 0, limit: 3 }) {
    let notes = await notes_js_1.default.find({}, { ownerDocID: 1, title: 1, content: 1, feedbackCount: 1, upvoteCount: 1 })
        .sort({ createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit)
        .populate('ownerDocID', 'profile_pic displayname studentID username');
    let extentedNotes = await Promise.all(notes.map(async (note) => {
        let isupvoted = await (0, voteService_js_1.isUpVoted)({ noteDocID: note._id.toString(), voterStudentDocID: studentDocID, voteType: 'upvote' });
        let issaved = await isSaved({ noteDocID: note._id.toString(), studentDocID: studentDocID });
        return { ...note.toObject(), isUpvoted: isupvoted, isSaved: issaved };
    }));
    return extentedNotes;
}
async function getOwner({ noteDocID }) {
    let ownerInfo = await notes_js_1.default.findById(noteDocID, { ownerDocID: 1 }).populate('ownerDocID');
    return ownerInfo;
}
async function isSaved({ studentDocID, noteDocID }) {
    let document = await students_js_1.default.find({ $and: [
            { _id: studentDocID },
            { saved_notes: { $in: [noteDocID] } }
        ]
    });
    return document.length !== 0 ? true : false;
}
