import { Router } from "express";
import { Server } from "socket.io";
import { getRequests } from "../requestService";
import { Convert } from "../userService";

const router = Router()

export default function requestsApiRouter(io: Server) {

    router.get("/", async (req, res) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let response = await getRequests(studentDocID)
            if (response.ok) {
                res.json({ ok: true, requests: response.requests })         
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}
