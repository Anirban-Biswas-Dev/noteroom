import { Server } from "socket.io";
import { addSaveNote, deleteSavedNote } from "../noteService.js";

export default function noteIOHandler(io: Server, socket: any) {
    socket.on('join-room', (room: string) => {
        socket.join(room)
    })
}
