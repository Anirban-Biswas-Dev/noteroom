import { Server } from "socket.io";
import { deleteNoti, readNoti } from "../notificationService.js";

export default function notificationIOHandler(io: Server, socket: any) {
    socket.on('delete-noti', async (notiID: any) => {
        await deleteNoti(notiID)
    })
    socket.on("read-noti", async (notiID: string) => {
        await readNoti(notiID)
    })
}