import { Router } from "express";
import { Server } from "socket.io";
import { getOwner } from "../../services/noteService";
import { NotificationSender } from "../../services/io/ioNotifcationService";
import { Convert } from "../../services/userService";
import addVote, { deleteVote, addCommentVote, deleteCommentVote } from "../../services/voteService";

const router = Router()

export function voteRouter(io: Server) {
    router.post('/vote', async (req, res) => {

        //CRITICAL: Don't increament-decreament upvotes from the client-side. just send them the new upvote-count to update the clinet-side
        const _noteDocID = req.body["noteDocID"]
        const noteOwnerInfo = await getOwner({noteDocID: _noteDocID}) 
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString()
        
        const action = req.query["action"]
        const on = req.query["on"]

        let voteType = <"upvote" | "downvote">req.query["type"]
        let noteDocID = req.body["noteDocID"]
        let _voterStudentID = req.body["voterStudentID"]
        let voterStudentDocID = (await Convert.getDocumentID_studentid(_voterStudentID)).toString()

        try {
            if (!on) {
                if (!action) {
                    let voteData = await addVote({ voteType, noteDocID, voterStudentDocID })
                    let upvoteCount = voteData["noteDocID"]["upvoteCount"]
        
                    io.emit('increment-upvote-dashboard', noteDocID)
                    io.to(noteDocID).emit('increment-upvote')
                    
                    if(_voterStudentID !== _ownerStudentID) {
                        upvoteCount % 5 === 0 || upvoteCount === 1 ? (async function() {
                            await NotificationSender(io, {
                                upvoteCount: upvoteCount,
                                noteDocID: noteDocID,
                                ownerStudentID: _ownerStudentID,
                                voterStudentDocID: voterStudentDocID
                            }).sendVoteNotification(voteData)
                        })() : false
                    }
                                
                    res.json({ok: true})
                        
                } else {
                    await deleteVote({ noteDocID, voterStudentDocID })
                    io.emit('decrement-upvote-dashboard', noteDocID)
                    io.to(noteDocID).emit('decrement-upvote')
    
                    res.json({ ok: true })
                }
            } else {
                let feedbackDocID = req.body["feedbackDocID"]                
                if (!action) {
                    await addCommentVote({ voteType, feedbackDocID, noteDocID, voterStudentDocID })
                    res.json({ ok: true })
                } else {
                    await deleteCommentVote({ feedbackDocID, voterStudentDocID })
                    res.json({ ok: true })
                }
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })
    return router
}
