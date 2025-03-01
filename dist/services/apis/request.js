"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestApi = requestApi;
const express_1 = require("express");
const userService_1 = require("../userService");
const requestService_1 = require("../requestService");
const ioNotifcationService_1 = require("../io/ioNotifcationService");
const noteService_1 = require("../noteService");
const router = (0, express_1.Router)();
function requestApi(io) {
    router.post("/send", async (req, res) => {
        try {
            let senderStudentID = req.session["stdid"];
            let senderDocumentID = (await userService_1.Convert.getDocumentID_studentid(senderStudentID)).toString();
            let recUsername = req.body["recUsername"];
            let recStudentID = (await userService_1.Convert.getStudentID_username(recUsername)).toString();
            if (recStudentID !== senderStudentID) {
                let message = req.body["message"];
                let recDocID = (await userService_1.Convert.getDocumentID_username(recUsername)).toString();
                let requestData = {
                    senderDocID: senderDocumentID,
                    receiverDocID: recDocID,
                    message: message
                };
                let request = await (0, requestService_1.addRequest)(requestData);
                let result = await (0, ioNotifcationService_1.NotificationSender)(io, {
                    ownerStudentID: recStudentID,
                    redirectTo: ``
                }).sendNotification({
                    event: 'notification-request',
                    content: 'sent you a request',
                }, senderDocumentID, request.toObject());
                res.json({ ok: true });
            }
            else {
                res.json({ ok: false, message: "You can't request something to yourself!" });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.get('/get', async (req, res) => {
        try {
            let studentID = req.session["stdid"];
            let studentDocID = (await userService_1.Convert.getDocumentID_studentid(studentID)).toString();
            let requests = await (0, requestService_1.getRequests)(studentDocID);
            res.json({ objects: requests });
        }
        catch (error) {
            res.json({ objects: [] });
        }
    });
    router.post('/done', async (req, res) => {
        try {
            let reqID = req.body["reqID"];
            let senderUserName = req.body["senderUserName"];
            let noteDocID = req.body["noteDocID"];
            let receiverDocID = await userService_1.Convert.getDocumentID_studentid(req.session["stdid"]);
            let senderStudentID = await userService_1.Convert.getStudentID_username(senderUserName);
            let note = await noteService_1.manageProfileNotes.getNote(undefined, undefined, noteDocID);
            let noteTitle = note["title"];
            let deleteResult = await (0, requestService_1.deleteRequest)(reqID);
            let notificationResult = await (0, ioNotifcationService_1.NotificationSender)(io, {
                ownerStudentID: senderStudentID,
                redirectTo: `/view/${noteDocID}`
            }).sendNotification({
                event: 'notification-request-done',
                content: `uploaded the note "${noteTitle.slice(0, 20)}..." as per your request`,
            }, receiverDocID);
            res.json({ ok: deleteResult && notificationResult });
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    router.post('/reject', async (req, res) => {
        try {
            let message = req.body["message"];
            let reqID = req.body["reqID"];
            if (message) {
                let senderUserName = req.body["senderUserName"];
                let senderStudentID = await userService_1.Convert.getStudentID_username(senderUserName);
                let receiverDocID = await userService_1.Convert.getDocumentID_studentid(req.session["stdid"]);
                let deleteResult = await (0, requestService_1.deleteRequest)(reqID);
                let notificationResult = await (0, ioNotifcationService_1.NotificationSender)(io, {
                    ownerStudentID: senderStudentID,
                    redirectTo: ``
                }).sendNotification({
                    event: 'notification-request-reject',
                    content: `rejected your request with the following message: "${message}"`,
                }, receiverDocID);
                res.json({ ok: deleteResult && notificationResult });
            }
            else {
                let deleteResult = await (0, requestService_1.deleteRequest)(reqID);
                res.json({ ok: deleteResult });
            }
        }
        catch (error) {
            res.json({ ok: false });
        }
    });
    return router;
}
