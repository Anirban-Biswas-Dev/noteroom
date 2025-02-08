"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = notificationIOHandler;
exports.NotificationSender = NotificationSender;
const notificationService_js_1 = require("../notificationService.js");
const server_js_1 = require("../../server.js");
function notificationIOHandler(io, socket) {
    socket.on('delete-noti', async (notiID) => {
        await (0, notificationService_js_1.deleteNoti)(notiID);
    });
    socket.on("read-noti", async (notiID) => {
        await (0, notificationService_js_1.readNoti)(notiID);
    });
}
function NotificationSender(io, globals) {
    return {
        async sendNotification({ content, title = '', event }, fromUserSudentDocID) {
            try {
                let ownerStudentID = globals.ownerStudentID;
                let redirectTo = globals.redirectTo || "";
                let baseDocument = {
                    notiType: event,
                    content: content,
                    title: title,
                    redirectTo: redirectTo,
                    ownerStudentID: ownerStudentID
                };
                let notification_db = !fromUserSudentDocID ? baseDocument : { ...baseDocument, fromUserSudentDocID };
                let notification_document = !fromUserSudentDocID ? await (0, notificationService_js_1.addNoti)(baseDocument) : await (0, notificationService_js_1.addInteractionNoti)(notification_db);
                let notification_io = {
                    notiID: notification_document["_id"].toString(),
                    title: notification_db.title,
                    content: notification_db.content,
                    redirectTo: redirectTo,
                    isRead: "false",
                    createdAt: notification_document["createdAt"],
                    fromUserSudentDocID: !fromUserSudentDocID ? null : notification_document["fromUserSudentDocID"]
                };
                io.to(server_js_1.userSocketMap.get(ownerStudentID)).emit(event, notification_io);
                return true;
            }
            catch (error) {
                return false;
            }
        }
    };
}
