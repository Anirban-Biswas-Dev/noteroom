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
exports.default = addVote;
exports.deleteVote = deleteVote;
exports.isUpVoted = isUpVoted;
exports.addCommentVote = addCommentVote;
exports.deleteCommentVote = deleteCommentVote;
exports.isCommentUpVoted = isCommentUpVoted;
const comments_js_1 = require("../schemas/comments.js");
const notes_js_1 = __importDefault(require("../schemas/notes.js"));
const votes_js_1 = __importStar(require("../schemas/votes.js"));
async function addVote({ noteDocID, voterStudentDocID, voteType }) {
    let existingVoteData = await votes_js_1.default.findOne({
        noteDocID: noteDocID,
        voterStudentDocID: voterStudentDocID,
        docType: { $ne: 'feedback' }
    });
    if (!existingVoteData) {
        let voteData = await votes_js_1.default.create({ noteDocID, voterStudentDocID, voteType });
        await notes_js_1.default.findByIdAndUpdate(noteDocID, { $inc: { upvoteCount: 1 } });
        return voteData.populate('noteDocID', 'title upvoteCount');
    }
    else {
        return { saved: false };
    }
}
async function deleteVote({ noteDocID, voterStudentDocID }) {
    let deleteResult = await votes_js_1.default.deleteOne({ $and: [{ noteDocID: noteDocID }, { voterStudentDocID: voterStudentDocID }] });
    if (deleteResult.deletedCount !== 0) {
        await notes_js_1.default.updateOne({ _id: noteDocID }, { $inc: { upvoteCount: -1 } });
    }
    let upvoteCount = (await notes_js_1.default.findOne({ _id: noteDocID }, { upvoteCount: 1 })).upvoteCount;
    return upvoteCount;
}
async function isUpVoted({ noteDocID, voterStudentDocID }) {
    let upvote_doc = await votes_js_1.default.findOne({ $and: [{ docType: { $ne: 'feedback' } }, { noteDocID: noteDocID }, { voterStudentDocID: voterStudentDocID }] });
    return upvote_doc ? true : false;
}
async function addCommentVote({ noteDocID, voterStudentDocID, voteType, feedbackDocID }) {
    let existingVoteData = await votes_js_1.CommentVotes.findOne({
        noteDocID: noteDocID,
        voterStudentDocID: voterStudentDocID,
        docType: 'feedback'
    });
    if (!existingVoteData) {
        let voteData = await votes_js_1.CommentVotes.create({ noteDocID, voterStudentDocID, voteType, feedbackDocID });
        await comments_js_1.feedbacksModel.findByIdAndUpdate(feedbackDocID, { $inc: { upvoteCount: 1 } });
        return voteData.populate([
            { path: 'noteDocID', select: 'title' },
            { path: 'voterStudentDocID', select: 'displayname' },
            {
                path: 'feedbackDocID',
                select: 'upvoteCount commenterDocID',
                populate: {
                    path: 'commenterDocID',
                    select: 'username studentID'
                }
            }
        ]);
    }
    else {
        return { saved: false };
    }
}
async function deleteCommentVote({ feedbackDocID, voterStudentDocID }) {
    let deleteResult = await votes_js_1.CommentVotes.deleteOne({ $and: [{ docType: { $eq: 'feedback' } }, { feedbackDocID: feedbackDocID }, { voterStudentDocID: voterStudentDocID }] });
    if (deleteResult.deletedCount !== 0) {
        await comments_js_1.feedbacksModel.findByIdAndUpdate(feedbackDocID, { $inc: { upvoteCount: -1 } });
        return { deleted: true };
    }
    else {
        return { deleted: false };
    }
}
async function isCommentUpVoted({ feedbackDocID, voterStudentDocID }) {
    let upvote_doc = await votes_js_1.CommentVotes.findOne({ $and: [{ docType: { $eq: 'feedback' } }, { feedbackDocID: feedbackDocID }, { voterStudentDocID: voterStudentDocID }] });
    return upvote_doc ? true : false;
}
