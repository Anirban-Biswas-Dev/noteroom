import { addSaveNote, deleteSavedNote } from "./noteService.js";
import { readNoti, deleteNoti } from "./notificationService.js";

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
        await deleteNoti(notiID)
    })
    socket.on("read-noti", async (notiID: string) => {
        await readNoti(notiID)
    })
}
