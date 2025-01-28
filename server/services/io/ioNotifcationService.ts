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
                notiType: event,
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