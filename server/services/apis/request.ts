import { Router } from "express"
import { Server } from "socket.io"
import { Convert } from "../userService"
import { addRequest, deleteRequest, getRequests } from "../requestService"
import { NotificationSender } from "../io/ioNotifcationService"
import { manageProfileNotes } from "../noteService"

const router = Router()

export function requestApi(io: Server) {
    router.post("/send", async (req, res) => {
        try {
            let senderStudentID = req.session["stdid"] 
            let senderDocumentID = (await Convert.getDocumentID_studentid(senderStudentID)).toString()

            let recUsername = req.body["recUsername"]
            let recStudentID = (await Convert.getStudentID_username(recUsername)).toString()

            if (recStudentID !== senderStudentID) {
                let message = req.body["message"]
                let recDocID = (await Convert.getDocumentID_username(recUsername)).toString()
                
                let requestData = {
                    senderDocID: senderDocumentID,
                    receiverDocID: recDocID,
                    message: message
                }
                await addRequest(requestData)
                
                await NotificationSender(io, { 
                    ownerStudentID: recStudentID,
                    redirectTo: ``
                }).sendNotification({
                    event: 'notification-request',
                    content: 'sent you a request',
                }, senderDocumentID)
                
                res.json({ ok: true })
            } else {
                res.json({ ok: false, message: "You can't request something to yourself!"})
            }
        } catch (error) {
            res.json({ ok: false })
        } 
    })


    router.get('/get', async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let requests = await getRequests(studentDocID)
            res.json({requests})         
        } catch (error) {
            res.json({requests: []})         
        }
    })

    router.post('/done', async (req, res) => {
        try {
            let reqID = req.body["reqID"]
            let senderUserName = req.body["senderUserName"]
            let noteDocID = req.body["noteDocID"]
            
            let receiverDocID = await Convert.getDocumentID_studentid(req.session["stdid"])

            let senderStudentID = await Convert.getStudentID_username(senderUserName)

            let note = await manageProfileNotes.getNote(undefined, undefined, noteDocID)
            let noteTitle = note["title"]

            let deleteResult = await deleteRequest(reqID)

            let notificationResult = await NotificationSender(io, { 
                ownerStudentID: senderStudentID,
                redirectTo: `/view/${noteDocID}`
            }).sendNotification({
                event: 'notification-request-done',
                content: `uploaded the note "${noteTitle.slice(0, 20)}..." as per your request`,
            }, receiverDocID)
            
            res.json({ ok: deleteResult && notificationResult })
        } catch (error) {
            res.json({ ok: false })
        }
    })


    router.post('/reject', async (req, res) => {
        try {
            let message = req.body["message"]
            let reqID = req.body["reqID"]
            if (message) {
                let senderUserName = req.body["senderUserName"]
                let senderStudentID = await Convert.getStudentID_username(senderUserName)

                let receiverDocID = await Convert.getDocumentID_studentid(req.session["stdid"])

                let deleteResult = await deleteRequest(reqID)
                
                let notificationResult = await NotificationSender(io, { 
                    ownerStudentID: senderStudentID,
                    redirectTo: ``
                }).sendNotification({
                    event: 'notification-request-reject',
                    content: `rejected your request with the following message: "${message}"`,
                }, receiverDocID)

                res.json({ ok: deleteResult && notificationResult })
                
            } else {
                let deleteResult = await deleteRequest(reqID) 
                res.json({ ok: deleteResult })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })


    return router
}
