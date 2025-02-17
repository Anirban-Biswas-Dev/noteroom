"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRequest = addRequest;
exports.getRequests = getRequests;
exports.deleteRequest = deleteRequest;
const requests_1 = __importDefault(require("../schemas/requests"));
async function addRequest(requestData) {
    let recData = await requests_1.default.create(requestData);
    return recData.populate([
        { path: 'senderDocID', select: 'studentID username displayname profile_pic' },
        { path: 'receiverDocID', select: 'studentID username displayname profile_pic' }
    ]);
}
async function getRequests(ownerDocID) {
    let requests = await requests_1.default.find({ receiverDocID: ownerDocID });
    let extendedRecData = await Promise.all(requests.map(async (recData) => {
        return recData.populate([
            { path: 'senderDocID', select: 'studentID username displayname profile_pic' },
            { path: 'receiverDocID', select: 'studentID username displayname profile_pic' }
        ]);
    }));
    return extendedRecData;
}
async function deleteRequest(reqID) {
    let deleteResult = await requests_1.default.deleteOne({ _id: reqID });
    return deleteResult.deletedCount !== 0;
}
