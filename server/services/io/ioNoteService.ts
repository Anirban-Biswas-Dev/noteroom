import { Server } from "socket.io";
import { addSaveNote, deleteSavedNote } from "../noteService.js";

export default function noteIOHandler(io: Server, socket: any) {
    socket.on('join-room', (room: string) => {
        socket.join(room)
    })

    socket.on('save-note', async (studentDocID: string, noteDocID: string) => {
        await addSaveNote({studentDocID, noteDocID})
    })
    socket.on('delete-saved-note', async (studentDocID: string, noteDocID: string) => {
        await deleteSavedNote({studentDocID, noteDocID})
    })
}
