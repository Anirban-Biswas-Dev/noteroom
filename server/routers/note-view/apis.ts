import { Router } from "express";
import { Server } from "socket.io";
import { getNote } from "../../services/noteService";

const router = Router({ mergeParams: true })

export default function apisRouter(io: Server) {
    router.get('/images', async (req, res) => {
        let noteDocID = req.params["noteID"]
        let images = await getNote({ noteDocID }, true)
        res.json(images)
    })

    return router
}
