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
            let commenterDisplayName = feedbackDocument["commenterDocID"]["displayname"];
            let notification_db = {
                commenterDocID: globals.commenterDocID,
                feedbackDocID: feedbackDocument._id.toString(),
                noteDocID: globals.noteDocID,
                ownerStudentID: ownerStudentID,
                content: `${commenterDisplayName} left a comment on your notes. Check it out!`
            };
            let notification_document = await (0, notificationService_js_1.addFeedbackNoti)(notification_db);
            let notification_io = {
                noteID: globals.noteDocID,
                notiID: notification_document["_id"].toString(),
                feedbackID: feedbackDocument["_id"].toString(),
                ownerStudentID: ownerStudentID,
                commenterDisplayName: commenterDisplayName,
                nfnTitle: feedbackDocument["noteDocID"]["title"],
                isread: "false",
                message: notification_db.content
            };
            io.to(ownerSocketID).emit('notification-feedback', notification_io);
        },
        async sendReplyNotification(replyDocument) {
            let commenterDisplayName = replyDocument["commenterDocID"]["displayname"];
            let notification_db = {
                noteDocID: globals.noteDocID,
                commenterDocID: replyDocument["commenterDocID"]._id.toString(),
                ownerStudentID: replyDocument["parentFeedbackDocID"]["commenterDocID"].studentID,
                feedbackDocID: replyDocument["_id"].toString(),
                parentFeedbackDocID: replyDocument["parentFeedbackDocID"]._id.toString(),
                content: `${commenterDisplayName} replied to your comment. See their response!`
            };
            let notification_document = await (0, notificationService_js_1.addReplyNoti)(notification_db);
            let notification_io = {
                noteID: globals.noteDocID,
                notiID: notification_document["_id"].toString(),
                feedbackID: replyDocument["_id"].toString(),
                ownerStudentID: "",
                isread: "false",
                nfnTitle: replyDocument["noteDocID"]["title"],
                commenterDisplayName: commenterDisplayName,
                message: notification_db.content
            };
            io.to(server_js_1.userSocketMap.get(notification_db.ownerStudentID)).emit("notification-reply", notification_io);
        },
        async sendVoteNotification(voteDocument) {
            let noteDocID = globals.noteDocID;
            let ownerStudentID = globals.ownerStudentID;
            let isFeedback = globals.feedback;
            let notification_data = {
                noteDocID: noteDocID,
                voteDocID: voteDocument._id.toString(),
                voterDocID: globals.voterStudentDocID,
                ownerStudentID: ownerStudentID,
                content: ``
            };
            if (!isFeedback) {
                notification_data.content = 'Your note is making an impact! just got some upvotes.';
                let notification_document = await (0, notificationService_js_1.addVoteNoti)(notification_data);
                let notification_io = {
                    isread: "false",
                    notiID: notification_document._id.toString(),
                    noteID: noteDocID,
                    nfnTitle: voteDocument["noteDocID"]["title"],
                    vote: true,
                    message: notification_data.content
                };
                io.to(server_js_1.userSocketMap.get(ownerStudentID)).emit('notification-upvote', notification_io);
            }
            else {
                notification_data.content = `Your comment is getting noticed! Someone liked what you said.`;
                let notification_document = await (0, notificationService_js_1.addVoteNoti)(notification_data, true);
                let notification_io = {
                    isread: "false",
                    notiID: notification_document._id.toString(),
                    noteID: noteDocID,
                    nfnTitle: voteDocument["noteDocID"]["title"],
                    vote: true,
                    message: notification_data.content
                };
                io.to(server_js_1.userSocketMap.get(ownerStudentID)).emit('notification-comment-upvote', notification_io);
            }
        },
        async sendMentionNotification(mentions, baseDocument) {
            if (mentions.length !== 0) {
                let mentionedStudentIDs = (await students_js_1.default.find({ username: { $in: mentions } }, { studentID: 1 })).map(data => data.studentID);
                mentionedStudentIDs.map(async (studentID) => {
                    if (globals.commenterStudentID !== studentID) {
                        let commenterDisplayName = baseDocument["commenterDocID"]["displayname"];
                        let notification_db = {
                            noteDocID: globals.noteDocID,
                            commenterDocID: globals.commenterDocID,
                            feedbackDocID: baseDocument["_id"].toString(),
                            mentionedStudentID: studentID,
                            content: `You were mentioned by ${commenterDisplayName}. Join the conversation!`
                        };
                        let notification_document = await (0, notificationService_js_1.addMentionNoti)(notification_db);
                        let notification_io = {
                            noteID: globals.noteDocID,
                            notiID: notification_document["_id"].toString(),
                            feedbackID: baseDocument["_id"].toString(),
                            mentionedStudentID: studentID,
                            commenterDisplayName: commenterDisplayName,
                            nfnTitle: baseDocument["noteDocID"]["title"],
                            isread: "false",
                            mention: true,
                            message: notification_db.content
                        };
                        io.to(server_js_1.userSocketMap.get(studentID)).emit("notification-mention", notification_io);
                    }
                });
            }
        },
    };
}
