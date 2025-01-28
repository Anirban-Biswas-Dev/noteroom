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

export function NotificationSender(io: Server, globals?: any) {
    return {
        async sendNotification({ content, title, event }) {
            let ownerStudentID = globals.ownerStudentID
            let redirectTo = globals.redirectTo || ""

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