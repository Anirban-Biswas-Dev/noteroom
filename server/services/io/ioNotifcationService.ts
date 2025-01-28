import { Server } from "socket.io";
import { addFeedbackNoti, addGeneralNoti, addMentionNoti, addNoteUploadConfirmationNoti, addNoti, addReplyNoti, addVoteNoti, deleteNoti, readNoti } from "../notificationService.js";
import { IFeedbackNotificationDB, IMentionNotificationDB, INoteUploadConfirmationNotificationDB, IReplyNotificationDB, IUpVoteNotificationDB, IGeneralNotificationDB } from "../../types/database.types.js";
import { IFeedBackNotification, IGeneralNotification, IMentionNotification, INoteUploadConfirmationNotification, IReplyNotification, IUpVoteNotification } from "../../types/notificationService.type.js";
import { userSocketMap } from "../../server.js";
import Students from "../../schemas/students.js";

export default function notificationIOHandler(io: Server, socket: any) {
    socket.on('delete-noti', async (notiID: any) => {
        await deleteNoti(notiID)
    })
    socket.on("read-noti", async (notiID: string) => {
        await readNoti(notiID)
    })
}

/**
* @description - 1. Create a notification document from reply/feedback data, 2. Create a notification object to send via WS, 3. Send the notification with appropiate event name 
*/
//NICE-TO-HAVE: clarify each studentID's role
//NICE-TO-HAVE: clarify globals
export function NotificationSender(io: Server, globals?: any) {
    return {
        async sendFeedbackNotification(feedbackDocument: any) {
            let ownerStudentID = globals.ownerStudentID
            let ownerSocketID = userSocketMap.get(ownerStudentID)
            let commenterDisplayName = feedbackDocument["commenterDocID"]["displayname"]
            
            let notification_db: IFeedbackNotificationDB = {
                commenterDocID: globals.commenterDocID,
                feedbackDocID: feedbackDocument._id.toString(),
                noteDocID: globals.noteDocID,
                ownerStudentID: ownerStudentID,
                content: `${commenterDisplayName} left a comment on your notes. Check it out!`
            }
            let notification_document = await addFeedbackNoti(notification_db)
    
            let notification_io: IFeedBackNotification = {
                noteID: globals.noteDocID,
                notiID: notification_document["_id"].toString(),
                feedbackID: feedbackDocument["_id"].toString(),
                ownerStudentID: ownerStudentID,
                commenterDisplayName: commenterDisplayName,
                nfnTitle: feedbackDocument["noteDocID"]["title"],
                isread: "false",
                message: notification_db.content
            } 
            io.to(ownerSocketID).emit('notification-feedback', notification_io)
        },
        
        async sendReplyNotification(replyDocument: any) {
            let commenterDisplayName = replyDocument["commenterDocID"]["displayname"]

            let notification_db: IReplyNotificationDB = {
                noteDocID: globals.noteDocID,
                commenterDocID: replyDocument["commenterDocID"]._id.toString(),
                ownerStudentID: replyDocument["parentFeedbackDocID"]["commenterDocID"].studentID, //* The student who gave the main feedback
                feedbackDocID: replyDocument["_id"].toString(),
                parentFeedbackDocID: replyDocument["parentFeedbackDocID"]._id.toString(),
                content: `${commenterDisplayName} replied to your comment. See their response!`
            }
            let notification_document = await addReplyNoti(notification_db)

            let notification_io: IReplyNotification = {
                noteID: globals.noteDocID,
                notiID: notification_document["_id"].toString(),
                feedbackID: replyDocument["_id"].toString(),
                ownerStudentID: "",
                isread: "false",
                nfnTitle: replyDocument["noteDocID"]["title"],
                commenterDisplayName: commenterDisplayName,
                message: notification_db.content
            }
            io.to(userSocketMap.get(notification_db.ownerStudentID)).emit("notification-reply", notification_io)
        },

        async sendVoteNotification(voteDocument: any) {
            let noteDocID = globals.noteDocID
            let ownerStudentID = globals.ownerStudentID
            let isFeedback = globals.feedback

            let notification_data: IUpVoteNotificationDB = {
                noteDocID: noteDocID,
                voteDocID: voteDocument._id.toString(),
                voterDocID: globals.voterStudentDocID,
                ownerStudentID: ownerStudentID,
                content: ``
            }

            if (!isFeedback) {
                notification_data.content = 'Your note is making an impact! just got some upvotes.'
                let notification_document = await addVoteNoti(notification_data)
                
                let notification_io: IUpVoteNotification = {
                    isread: "false",
                    notiID: notification_document._id.toString(),
                    noteID: noteDocID,
                    nfnTitle: voteDocument["noteDocID"]["title"],
                    vote: true,
                    message: notification_data.content
                }
    
                io.to(userSocketMap.get(ownerStudentID)).emit('notification-upvote', notification_io)
            } else {
                notification_data.content = `Your comment is getting noticed! Someone liked what you said.`
                let notification_document = await addVoteNoti(notification_data, true)

                let notification_io: IUpVoteNotification = {
                    isread: "false",
                    notiID: notification_document._id.toString(),
                    noteID: noteDocID,
                    nfnTitle: voteDocument["noteDocID"]["title"],
                    vote: true,
                    message: notification_data.content
                }
                io.to(userSocketMap.get(ownerStudentID)).emit('notification-comment-upvote', notification_io)
            }
        },
        
        /**
        * @param baseDocument - This will be the feedback/reply data on which the mentions will be filtered
        * @param mentions - A list of usernames
        */
        async sendMentionNotification(mentions: string[], baseDocument: any) {
            if (mentions.length !== 0) {
                let mentionedStudentIDs = (await Students.find({ username: { $in: mentions } }, { studentID: 1 })).map(data => data.studentID)
                mentionedStudentIDs.map(async studentID => {
                    if (globals.commenterStudentID !== studentID) {
                        let commenterDisplayName = baseDocument["commenterDocID"]["displayname"]
                        let notification_db: IMentionNotificationDB = {
                            noteDocID: globals.noteDocID,
                            commenterDocID: globals.commenterDocID,
                            feedbackDocID: baseDocument["_id"].toString(),
                            mentionedStudentID: studentID,
                            content: `You were mentioned by ${commenterDisplayName}. Join the conversation!`
                        }
                        let notification_document = await addMentionNoti(notification_db)
    
                        let notification_io: IMentionNotification = {
                            noteID: globals.noteDocID,
                            notiID: notification_document["_id"].toString(),
                            feedbackID: baseDocument["_id"].toString(),
                            mentionedStudentID: studentID,
                            commenterDisplayName: commenterDisplayName,
                            nfnTitle: baseDocument["noteDocID"]["title"],
                            isread: "false",
                            mention: true,
                            message: notification_db.content
                        }
                        io.to(userSocketMap.get(studentID)).emit("notification-mention", notification_io)
                    }
                })
            }
        },


        /**
        * @param {Object} noteData 
        * @description - This is the saved note's document object
        */
        async sendNoteUploadConfirmationNotification(noteData: any, type: 'success' | 'failure') {
            let ownerStudentID = globals.ownerStudentID
            let content = type === 'success' ? 'Your note is successfully uploaded!' : "Your note couldn't be uploaded successfully!"

            //CRITICAL: handle the note upload failure
            let notification_db: INoteUploadConfirmationNotificationDB = {
                noteDocID: noteData["_id"].toString(),
                ownerStudentID: ownerStudentID,
                content: content
            }
            let notification_document = await addNoteUploadConfirmationNoti(notification_db)

            let notification_io: INoteUploadConfirmationNotification = {
                isread: "false",
                message: notification_db.content,
                nfnTitle: noteData["title"],
                noteID: noteData["_id"].toString(),
                notiID: notification_document._id.toString() ,
            }
            io.to(userSocketMap.get(ownerStudentID)).emit("notification-note-upload-confirmation", notification_io)
        },


        async sendGeneralNotification({ content, title }) {
            let ownerStudentID = globals.ownerStudentID

            let notification_db: IGeneralNotificationDB = {
                ownerStudentID: ownerStudentID,
                content: content,
                title: title
            }
            let notification_document = await addGeneralNoti(notification_db)
            
            let notification_io: IGeneralNotification = {
                general: true,
                isread: "false",
                notiID: notification_document["_id"].toString(),
                message: content,
                nfnTitle: title
            }
            io.to(userSocketMap.get(ownerStudentID)).emit("notification-general", notification_io)
        },


        async sendNotification({ content, title, event }) {
            let ownerStudentID = globals.ownerStudentID
            let redirectTo = globals.redirectTo

            let notification_db = {
                notiType: 'notification-feedback',
                content: content,
                title: title,
                redirectTo: redirectTo,
                ownerStudentID: ownerStudentID
            }
            let notification_document = await addNoti(notification_db)

            let notification_io = {
                notiID: notification_document["_id"].toString(),
                title: notification_db.title,
                content: notification_db.content,
                redirectTo: redirectTo,
                isread: "false"
            }
            io.to(userSocketMap.get(ownerStudentID)).emit(event, notification_io)
        }
    }
}