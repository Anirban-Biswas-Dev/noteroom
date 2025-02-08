import { Router } from "express";
import { Server } from "socket.io";
import { getNote } from "../../services/noteService";
import { getComments } from "../../services/feedbackService";
import { Convert } from "../../services/userService";

const router = Router({ mergeParams: true })

export default function apisRouter(io: Server) {
    router.get('/images', async (req, res) => {
        try {
            let noteDocID = req.params["noteID"]
            let images = await getNote({ noteDocID }, true)
            res.json(images)
        } catch (error) {
            res.json([])
        }
    })

    router.get('/comments', async (req, res) => {
        let noteDocID = req.params["noteID"]
        let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()

        let feedbacks = await getComments({ noteDocID, studentDocID })
        res.json(feedbacks)
    })

    return router
}

