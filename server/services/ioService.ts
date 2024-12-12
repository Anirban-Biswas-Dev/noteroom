import { Server as IOServer } from "socket.io";
import { Notifs } from "../schemas/notifications.js";
import { addSaveNote, deleteSavedNote, getOwner } from "./noteService.js";
import { addFeedbackNoti, addMentionNoti, readNoti } from "./notificationService.js";
import { Convert } from "./userService.js";
import { addFeedback, IFeedBack } from "./feedbackService.js";
import Students from "../schemas/students.js";

export interface ISentFeedBack {
    room: string,
    feedbackText: string,
    noteDocID: string,
    commenterStudentID: string
}

export async function noteSocketHandler(socket: any) {
    socket.on('save-note', async (studentDocID: string, noteDocID: string) => {
        await addSaveNote({studentDocID, noteDocID})
    })
    socket.on('delete-saved-note', async (studentDocID: string, noteDocID: string) => {
        await deleteSavedNote({studentDocID, noteDocID})
    })
}


export async function notificationSocketHandler(socket: any) {
    socket.on('delete-noti', async (notiID: any) => {
        await Notifs.deleteOne({ _id: notiID }) // Deleteing notification based on the ID given from the frontend
    })
    socket.on("read-noti", async (notiID: string) => {
        await readNoti(notiID)
    })
}
