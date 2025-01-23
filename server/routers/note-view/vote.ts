import { Router } from "express";
import { Server } from "socket.io";
import { getOwner } from "../../services/noteService";
import { NotificationSender } from "../../services/io/ioNotifcationService";
import { Convert } from "../../services/userService";
import addVote, { deleteVote, addCommentVote, deleteCommentVote } from "../../services/voteService";

const router = Router({ mergeParams: true})

export function voteRouter(io: Server) {
    router.post('/vote/feedback', async (req, res) => {
        let action = req.query["action"]
        let feedbackDocID = req.body["feedbackDocID"]
        let voteType = <"upvote" | "downvote">req.query["type"]
        let noteDocID = req.body["noteDocID"]
        let _voterStudentID = req.body["voterStudentID"]
        let voterStudentDocID = (await Convert.getDocumentID_studentid(_voterStudentID)).toString()

    
        if (!action) {
            let voteData = await addCommentVote({ voteType, feedbackDocID, noteDocID, voterStudentDocID })

            let feedbackOwner = voteData["feedbackDocID"]["commenterDocID"]
            let upvoteCount = voteData["feedbackDocID"]["upvoteCount"]

            if (_voterStudentID !== feedbackOwner["studentID"]) {
                upvoteCount === 1 || upvoteCount % 5 ? (async function() {
                    await NotificationSender(io, {
                        upvoteCount: upvoteCount,
                        noteDocID: noteDocID,
                        ownerStudentID: feedbackOwner["studentID"],
                        voterStudentDocID: voterStudentDocID,
                        feedback: true
                    }).sendVoteNotification(voteData)
                })() : false
            }

            res.json({ ok: true })
        } else if (action === "delete") {
            await deleteCommentVote({ feedbackDocID, voterStudentDocID })
            res.json({ ok: true })
        }
    })

    router.post('/vote', async (req, res) => {

        const _noteDocID = req.body["noteDocID"]
        const noteOwnerInfo = await getOwner({noteDocID: _noteDocID}) 
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString()
        
        const action = req.query["action"]

        let voteType = <"upvote" | "downvote">req.query["type"]
        let noteDocID = req.body["noteDocID"]
        let _voterStudentID = req.body["voterStudentID"]
        let voterStudentDocID = (await Convert.getDocumentID_studentid(_voterStudentID)).toString()

        try {
            if (!action) {
                let voteData = await addVote({ voteType, noteDocID, voterStudentDocID })
                if (voteData["saved"]) return { ok: false }
                
                let upvoteCount = voteData["noteDocID"]["upvoteCount"]
    
                io.emit('update-upvote-dashboard', noteDocID, upvoteCount)
                io.to(noteDocID).emit('update-upvote', upvoteCount)
                
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
                let upvoteCount = await deleteVote({ noteDocID, voterStudentDocID })
                io.emit('update-upvote-dashboard', noteDocID, upvoteCount)
                io.to(noteDocID).emit('update-upvote', upvoteCount)

                res.json({ ok: true })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })
    return router
}
