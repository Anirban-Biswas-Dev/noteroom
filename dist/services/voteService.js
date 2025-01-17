"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addVote;
exports.deleteVote = deleteVote;
exports.isUpVoted = isUpVoted;
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const votes_js_1 = __importDefault(require("../schemas/votes.js"));
async function addVote({ noteDocID, voterStudentDocID, voteType }) {
    await notes_js_1.default.findByIdAndUpdate(noteDocID, { $inc: { upvoteCount: 1 } });
    let voteData = await votes_js_1.default.create({ noteDocID, voterStudentDocID, voteType });
    return voteData.populate('noteDocID', 'title upvoteCount');
}
async function deleteVote({ noteDocID, voterStudentDocID }) {
    await votes_js_1.default.deleteOne({ $and: [{ noteDocID: noteDocID }, { voterStudentDocID: voterStudentDocID }] });
    await notes_js_1.default.updateOne({ _id: noteDocID }, { $inc: { upvoteCount: -1 } });
}
async function isUpVoted({ noteDocID, voterStudentDocID }) {
    let upvote_doc = await votes_js_1.default.findOne({ $and: [{ noteDocID: noteDocID }, { voterStudentDocID: voterStudentDocID }] });
    return upvote_doc ? true : false;
}
