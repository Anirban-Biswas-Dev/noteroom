"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = notificationIOHandler;
exports.NotificationSender = NotificationSender;
const notificationService_js_1 = require("../notificationService.js");
const server_js_1 = require("../../server.js");
const students_js_1 = __importDefault(require("../../schemas/students.js"));
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
        async sendFeedbackNotification(feedbackDocument) {
            let ownerStudentID = globals.ownerStudentID;
            let ownerSocketID = server_js_1.userSocketMap.get(ownerStudentID);
            let notification_db = {
                commenterDocID: globals.commenterDocID,
                feedbackDocID: feedbackDocument._id.toString(),
                noteDocID: globals.noteDocID,
                ownerStudentID: ownerStudentID
            };
            let notification_document = await (0, notificationService_js_1.addFeedbackNoti)(notification_db);
            let notification_io = {
                noteID: globals.noteDocID,
                notiID: notification_document["_id"].toString(),
                feedbackID: feedbackDocument["_id"].toString(),
                ownerStudentID: ownerStudentID,
                commenterDisplayName: feedbackDocument["commenterDocID"]["displayname"],
                nfnTitle: feedbackDocument["noteDocID"]["title"],
                isread: "false",
            };
            io.to(ownerSocketID).emit('notification-feedback', notification_io, "has given feedback on your notes! Check it out.");
        },
        async sendReplyNotification(replyDocument) {
            let notification_db = {
                noteDocID: globals.noteDocID,
                commenterDocID: replyDocument["commenterDocID"]._id.toString(),
                ownerStudentID: replyDocument["parentFeedbackDocID"]["commenterDocID"].studentID,
                feedbackDocID: replyDocument["_id"].toString(),
                parentFeedbackDocID: replyDocument["parentFeedbackDocID"]._id.toString()
            };
            let notification_document = await (0, notificationService_js_1.addReplyNoti)(notification_db);
            let notification_io = {
                noteID: globals.noteDocID,
                notiID: notification_document["_id"].toString(),
                feedbackID: replyDocument["_id"].toString(),
                ownerStudentID: "",
                isread: "false",
                nfnTitle: replyDocument["noteDocID"]["title"],
                commenterDisplayName: replyDocument["commenterDocID"]["displayname"]
            };
            io.to(server_js_1.userSocketMap.get(notification_db.ownerStudentID)).emit("notification-reply", notification_io, "replied to your comment");
        },
        async sendVoteNotification(voteDocument) {
            let upvoteCount = globals.upvoteCount;
            let noteDocID = globals.noteDocID;
            let ownerStudentID = globals.ownerStudentID;
            let notification_data = {
                noteDocID: noteDocID,
                voteDocID: voteDocument._id.toString(),
                voterDocID: globals.voterStudentDocID,
                ownerStudentID: ownerStudentID
            };
            let notification_document = await (0, notificationService_js_1.addVoteNoti)(notification_data);
            let notification_io = {
                isread: "false",
                notiID: notification_document._id.toString(),
                noteID: noteDocID,
                nfnTitle: voteDocument["noteDocID"]["title"],
                vote: true
            };
            io.to(server_js_1.userSocketMap.get(ownerStudentID)).emit('notification-upvote', notification_io, `${upvoteCount} upvotes!! Just got an upvote!`);
        },
        async sendMentionNotification(mentions, baseDocument) {
            if (mentions.length !== 0) {
                let mentionedStudentIDs = (await students_js_1.default.find({ username: { $in: mentions } }, { studentID: 1 })).map(data => data.studentID);
                mentionedStudentIDs.map(async (studentID) => {
                    if (globals.commenterStudentID !== studentID) {
                        let notification_db = {
                            noteDocID: globals.noteDocID,
                            commenterDocID: globals.commenterDocID,
                            feedbackDocID: baseDocument["_id"].toString(),
                            mentionedStudentID: studentID
                        };
                        let notification_document = await (0, notificationService_js_1.addMentionNoti)(notification_db);
                        let notification_io = {
                            noteID: globals.noteDocID,
                            notiID: notification_document["_id"].toString(),
                            feedbackID: baseDocument["_id"].toString(),
                            mentionedStudentID: studentID,
                            commenterDisplayName: baseDocument["commenterDocID"]["displayname"],
                            nfnTitle: baseDocument["noteDocID"]["title"],
                            isread: "false",
                            mention: true
                        };
                        io.to(server_js_1.userSocketMap.get(studentID)).emit("notification-mention", notification_io, "has mentioned you");
                    }
                });
            }
        },
    };
}
