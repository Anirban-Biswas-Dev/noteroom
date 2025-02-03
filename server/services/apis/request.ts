import { Router } from "express"
import { Server } from "socket.io"
import { Convert } from "../userService"
import { addRequest } from "../requestService"

const router = Router()

export function requestApi(io: Server) {
    router.post("/send", async (req, res) => {
        try {
            let senderStudentID = req.session["stdid"] 
            let senderDocumentID = (await Convert.getDocumentID_studentid(senderStudentID)).toString()

            let recUsername = req.body["recUsername"]
            let message = req.body["message"]
            let recDocID = (await Convert.getDocumentID_username(recUsername)).toString()
            

            let requestData = {
                senderDocID: senderDocumentID,
                receiverDocID: recDocID,
                message: message
            }
            let request = await addRequest(requestData)
            console.log(request)
            
            res.json({ ok: true })
        } catch (error) {
            res.json({ ok: false })
            console.log(error)
        } 
    })

    return router
}
