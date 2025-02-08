"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageProfileNotes = void 0;
exports.addNote = addNote;
exports.addQuickPost = addQuickPost;
exports.deleteNote = deleteNote;
exports.addSaveNote = addSaveNote;
exports.deleteSavedNote = deleteSavedNote;
exports.getNote = getNote;
exports.getNoteForShare = getNoteForShare;
exports.getAllNotes = getAllNotes;
exports.getOwner = getOwner;
exports.isSaved = isSaved;
const students_js_1 = __importDefault(require("../schemas/students.js"));
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const comments_js_1 = __importDefault(require("../schemas/comments.js"));
const firebaseService_js_1 = require("./firebaseService.js");
const voteService_js_1 = require("./voteService.js");
const mongoose_1 = __importDefault(require("mongoose"));
const jsdom_1 = require("jsdom");
async function addNote(noteData) {
    let note = await notes_js_1.default.create(noteData);
    await students_js_1.default.findByIdAndUpdate(noteData.ownerDocID, { $push: { owned_notes: note._id } }, { upsert: true, new: true });
    return note;
}
async function addQuickPost(postData) {
    let post = await notes_js_1.default.create(postData);
    await students_js_1.default.findByIdAndUpdate(postData.ownerDocID, { $push: { owned_posts: post._id } }, { upsert: true, new: true });
    return post;
}
async function deleteNote({ studentDocID, noteDocID }, post = false) {
    try {
        let deleteResult = await notes_js_1.default.deleteOne({ _id: noteDocID, ownerDocID: studentDocID });
        if (deleteResult.deletedCount !== 0) {
            post ?
                await students_js_1.default.updateOne({ _id: studentDocID }, { $pull: { owned_posts: noteDocID } }) : await students_js_1.default.updateOne({ _id: studentDocID }, { $pull: { owned_notes: noteDocID } });
            await comments_js_1.default.deleteMany({ noteDocID: noteDocID });
            await (0, voteService_js_1.deleteAllVotes)(noteDocID);
            await (0, firebaseService_js_1.deleteNoteImages)({ studentDocID, noteDocID }, post);
        }
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
        let savedNote = await notes_js_1.default.aggregate([
            { $match: { _id: new mongoose_1.default.Types.ObjectId(noteDocID) } },
            { $project: {
                    title: 1,
                    thumbnail: { $first: '$content' }
                } }
        ]);
        return { ok: true, count: saved_notes_count, savedNote: savedNote };
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
async function getNote({ noteDocID, studentDocID }, images = false) {
    try {
        if (!images) {
            let _note = (await notes_js_1.default.findById(noteDocID, { title: 1, subject: 1, description: 1, ownerDocID: 1, upvoteCount: 1, postType: 1 })).toObject();
            let _isNoteUpvoted = await (0, voteService_js_1.isUpVoted)({ noteDocID, voterStudentDocID: studentDocID });
            let _isSaved = await isSaved({ studentDocID, noteDocID });
            let note = { ..._note, isUpvoted: _isNoteUpvoted, isSaved: _isSaved };
            let owner = await students_js_1.default.findById(note.ownerDocID, { displayname: 1, studentID: 1, profile_pic: 1, username: 1 });
            let returnedNote = { note: note, owner: owner };
            return returnedNote;
        }
        else {
            let images = (await notes_js_1.default.findById(noteDocID, { content: 1 })).content;
            return images;
        }
    }
    catch (error) {
        return { error: true };
    }
}
async function getNoteForShare({ noteDocID, studentDocID }) {
    let _note = await notes_js_1.default.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(noteDocID) } },
        { $project: {
                title: 1,
                description: 1,
                thumbnail: { $first: "$content" }
            } }
    ]);
    let note = _note[0];
    let parser = new jsdom_1.JSDOM(note["description"]);
    let description = parser.window.document.querySelector('body').textContent;
    return { ...note, description: description };
}
async function getAllNotes(studentDocID, options) {
    let notes = await notes_js_1.default.aggregate([
        { $match: { completed: { $eq: true } } },
        { $lookup: {
                from: 'students',
                localField: 'ownerDocID',
                foreignField: '_id',
                as: 'ownerDocID'
            } },
        { $addFields: {
                A: { $add: ["$feedbackCount", 1234567] },
                C: { $add: [
                        { $multiply: [{ $add: ["$upvoteCount", 10] }, 9876543] },
                        { $multiply: [{ $add: [{ $size: "$content" }, 1] }, 22695477] }
                    ] }
            } },
        { $addFields: {
                randomSort: {
                    $mod: [
                        { $add: [{ $multiply: ["$A", parseInt(options.seed)] }, "$C"] },
                        Math.pow(2, 32)
                    ]
                }
            } },
        { $unwind: {
                path: '$ownerDocID',
            } },
        { $project: {
                title: 1, description: 1,
                feedbackCount: 1, upvoteCount: 1,
                postType: 1, content: 1, randomSort: 1,
                createdAt: 1,
                "ownerDocID._id": 1,
                "ownerDocID.profile_pic": 1,
                "ownerDocID.displayname": 1,
                "ownerDocID.studentID": 1,
                "ownerDocID.username": 1
            } },
        { $addFields: {
                isOwner: { $eq: ["$ownerDocID._id", new mongoose_1.default.Types.ObjectId(studentDocID)] }
            } },
        { $sort: { randomSort: 1 } },
        { $skip: parseInt(options.skip) },
        { $limit: parseInt(options.limit) }
    ]);
    let extentedNotes = await Promise.all(notes.map(async (note) => {
        let isupvoted = await (0, voteService_js_1.isUpVoted)({ noteDocID: note["_id"].toString(), voterStudentDocID: studentDocID, voteType: 'upvote' });
        let issaved = await isSaved({ noteDocID: note["_id"].toString(), studentDocID: studentDocID });
        return { ...note, isUpvoted: isupvoted, isSaved: issaved };
    }));
    return extentedNotes;
}
exports.manageProfileNotes = {
    async getNote(type, studentID, noteDocID) {
        if (!noteDocID) {
            let student = await students_js_1.default.findOne({ studentID: studentID }, { saved_notes: 1, owned_notes: 1 });
            let notes_ids = student[type === "saved" ? "saved_notes" : "owned_notes"];
            let notes = await notes_js_1.default.aggregate([
                { $match: { _id: { $in: notes_ids } } },
                { $project: {
                        title: 1,
                        thumbnail: { $first: '$content' }
                    } }
            ]);
            return notes;
        }
        else {
            let note = await notes_js_1.default.findOne({ _id: noteDocID });
            return note;
        }
    },
    async getNoteCount(type, studentID) {
        let student = await students_js_1.default.findOne({ studentID: studentID }, { saved_notes: 1, owned_notes: 1 });
        let notes_ids = student[type === "saved" ? "saved_notes" : "owned_notes"];
        return notes_ids.length;
    }
};
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
