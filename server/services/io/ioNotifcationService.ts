import { Server } from "socket.io";
import { addFeedbackNoti, addMentionNoti, addReplyNoti, addVoteNoti, deleteNoti, readNoti } from "../notificationService.js";
import { IFeedbackNotificationDB, IMentionNotificationDB, IReplyNotificationDB, IUpVoteNotificationDB } from "../../types/database.types.js";
import { IFeedBackNotification, IMentionNotification, IReplyNotification, IUpVoteNotification } from "../../types/notificationService.type.js";
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
            
            let notification_db: IFeedbackNotificationDB = {
                commenterDocID: globals.commenterDocID,
                feedbackDocID: feedbackDocument._id.toString(),
                noteDocID: globals.noteDocID,
                ownerStudentID: ownerStudentID
            }
            let notification_document = await addFeedbackNoti(notification_db)
    
            let notification_io: IFeedBackNotification = {
                noteID: globals.noteDocID,
                notiID: notification_document["_id"].toString(),
                feedbackID: feedbackDocument["_id"].toString(),
                ownerStudentID: ownerStudentID,
                commenterDisplayName: feedbackDocument["commenterDocID"]["displayname"],
                nfnTitle: feedbackDocument["noteDocID"]["title"],
                isread: "false",
            } 
            io.to(ownerSocketID).emit('notification-feedback', notification_io, `${notification_io.commenterDisplayName} left a comment on your notes. Check it out!`)
        },
        
        async sendReplyNotification(replyDocument: any) {
            let notification_db: IReplyNotificationDB = {
                noteDocID: globals.noteDocID,
                commenterDocID: replyDocument["commenterDocID"]._id.toString(),
                ownerStudentID: replyDocument["parentFeedbackDocID"]["commenterDocID"].studentID, //* The student who gave the main feedback
                feedbackDocID: replyDocument["_id"].toString(),
                parentFeedbackDocID: replyDocument["parentFeedbackDocID"]._id.toString()
            }
            let notification_document = await addReplyNoti(notification_db)

            let notification_io: IReplyNotification = {
                noteID: globals.noteDocID,
                notiID: notification_document["_id"].toString(),
                feedbackID: replyDocument["_id"].toString(),
                ownerStudentID: "",
                isread: "false",
                nfnTitle: replyDocument["noteDocID"]["title"],
                commenterDisplayName: replyDocument["commenterDocID"]["displayname"]
            }
            io.to(userSocketMap.get(notification_db.ownerStudentID)).emit("notification-reply", notification_io, `${notification_io.commenterDisplayName} replied to your comment. See their response!`)
        },

        async sendVoteNotification(voteDocument: any) {
            let noteDocID = globals.noteDocID
            let ownerStudentID = globals.ownerStudentID
            let isFeedback = globals.feedback

            let notification_data: IUpVoteNotificationDB = {
                noteDocID: noteDocID,
                voteDocID: voteDocument._id.toString(),
                voterDocID: globals.voterStudentDocID,
                ownerStudentID: ownerStudentID
            }

            if (!isFeedback) {
                let notification_document = await addVoteNoti(notification_data)
                
                let notification_io: IUpVoteNotification = {
                    isread: "false",
                    notiID: notification_document._id.toString(),
                    noteID: noteDocID,
                    nfnTitle: voteDocument["noteDocID"]["title"],
                    vote: true
                }
    
                io.to(userSocketMap.get(ownerStudentID)).emit('notification-upvote', notification_io, `Your note is making an impact! just got some upvotes.`)
            } else {
                let notification_document = await addVoteNoti(notification_data, true)

                let notification_io: IUpVoteNotification = {
                    isread: "false",
                    notiID: notification_document._id.toString(),
                    noteID: noteDocID,
                    nfnTitle: voteDocument["noteDocID"]["title"],
                    vote: true
                }
                io.to(userSocketMap.get(ownerStudentID)).emit('notification-comment-upvote', notification_io, `Your comment is getting noticed! Someone liked what you said.`)
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
                        let notification_db: IMentionNotificationDB = {
                            noteDocID: globals.noteDocID,
                            commenterDocID: globals.commenterDocID,
                            feedbackDocID: baseDocument["_id"].toString(),
                            mentionedStudentID: studentID
                        }
                        let notification_document = await addMentionNoti(notification_db)
    
                        let notification_io: IMentionNotification = {
                            noteID: globals.noteDocID,
                            notiID: notification_document["_id"].toString(),
                            feedbackID: baseDocument["_id"].toString(),
                            mentionedStudentID: studentID,
                            commenterDisplayName: baseDocument["commenterDocID"]["displayname"],
                            nfnTitle: baseDocument["noteDocID"]["title"],
                            isread: "false",
                            mention: true
                        }
                        io.to(userSocketMap.get(studentID)).emit("notification-mention", notification_io, `You were mentioned by ${notification_io.commenterDisplayName}. Join the conversation!`)
                    }
                })
            }
        },
    }
}