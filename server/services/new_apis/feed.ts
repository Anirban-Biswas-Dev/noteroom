import { Router } from "express";
import { Server } from "socket.io";
import { log } from "../../helpers/utils";
import { getPosts } from "../noteService";
import { Convert } from "../userService";

const router = Router()

export default function feedApiRouter(io: Server) {
    router.get("/", async (req, res) => {
        try {
            const count = 7
            const page = Number(req.query.page) || 1
            const seed: number = Number(req.query.seed)
            const skip: number = (page - 1) * count
            
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d")).toString()
            let notes = await getPosts(studentDocID, { skip: skip, limit: count, seed: seed })
            if (notes.length != 0) {
                res.json(notes)
            } else {
                res.json([])
            }
        } catch (error) {
            res.json([])
        }
    })

    return router
}
