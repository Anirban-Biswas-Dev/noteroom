import { Router } from "express"
import { Server } from "socket.io"
import { Convert } from "../userService"
import { addRequest, getRequests } from "../requestService"
import { NotificationSender } from "../io/ioNotifcationService"

const router = Router()

export function requestApi(io: Server) {
    router.post("/send", async (req, res) => {
        try {
            let senderStudentID = req.session["stdid"] 
            let senderDocumentID = (await Convert.getDocumentID_studentid(senderStudentID)).toString()

            let recUsername = req.body["recUsername"]
            let message = req.body["message"]
            let recDocID = (await Convert.getDocumentID_username(recUsername)).toString()
            let recStudentID = (await Convert.getStudentID_username(recUsername)).toString()
            
            let requestData = {
                senderDocID: senderDocumentID,
                receiverDocID: recDocID,
                message: message
            }
            let request = await addRequest(requestData)
            console.log(request)
            
            await NotificationSender(io, { 
                ownerStudentID: recStudentID,
                redirectTo: ``
            }).sendNotification({
                event: 'notification-request',
                content: 'sent you a request',
            }, senderDocumentID)
            
            res.json({ ok: true })
        } catch (error) {
            res.json({ ok: false })
            console.log(error)
        } 
    })


    router.get('/get', async (req, res) => {
        let studentID = req.session["stdid"]
        let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
        let requests = await getRequests(studentDocID)
        res.json({requests})
    })

    return router
}
