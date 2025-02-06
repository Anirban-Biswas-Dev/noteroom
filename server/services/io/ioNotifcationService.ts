import { Server } from "socket.io";
import { addInteractionNoti, addNoti, deleteNoti, readNoti } from "../notificationService.js";
import { userSocketMap } from "../../server.js";

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
        //content: for interactions, only the text of the interaction (after the profile-picture and displayname)
        async sendNotification({ content, title='', event }, fromUserSudentDocID?: any) {
            try {
                let ownerStudentID = globals.ownerStudentID
                let redirectTo = globals.redirectTo || ""
    
                let baseDocument = {
                    notiType: event,
                    content: content,
                    title: title,
                    redirectTo: redirectTo,
                    ownerStudentID: ownerStudentID
                }
    
                let notification_db = !fromUserSudentDocID ? baseDocument : { ...baseDocument, fromUserSudentDocID } 
                let notification_document = !fromUserSudentDocID ? await addNoti(baseDocument) : await addInteractionNoti(notification_db)
    
                let notification_io = {
                    notiID: notification_document["_id"].toString(),
                    title: notification_db.title,
                    content: notification_db.content,
                    redirectTo: redirectTo,
                    isRead: "false",
                    createdAt: notification_document["createdAt"],
                    fromUserSudentDocID: !fromUserSudentDocID ? null : notification_document["fromUserSudentDocID"]
                }
                io.to(userSocketMap.get(ownerStudentID)).emit(event, notification_io)

                return true
            } catch (error) {
                return false
            }
        }
    }
}