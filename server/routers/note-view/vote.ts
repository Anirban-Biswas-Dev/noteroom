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

        try {
            if (!action) {
                let voteData = await addCommentVote({ voteType, feedbackDocID, noteDocID, voterStudentDocID })
                if (voteData["saved"]) return { ok: false}
    
                let feedbackOwner = voteData["feedbackDocID"]["commenterDocID"]
                let upvoteCount = voteData["feedbackDocID"]["upvoteCount"]
                let isQuickPost = voteData["noteDocID"]["postType"] === 'quick-post'
    
                if (_voterStudentID !== feedbackOwner["studentID"]) {
                    let postTitle = (voteData["noteDocID"]["title"]?.slice(0, 20) || voteData["noteDocID"]["description"].slice(0, 20)) + '...'
                    upvoteCount === 1 || upvoteCount % 5 ? (async function() {
                        await NotificationSender(io, {
                            ownerStudentID: feedbackOwner["studentID"],
                            redirectTo: isQuickPost ? `/view/quick-post/${noteDocID}` : `/view/${noteDocID}`
                        }).sendNotification({
                            content: `Your comment on "${postTitle}" is getting noticed! It has received ${upvoteCount} like${upvoteCount === 1 ? '' : 's'}.`,
                            event: 'notification-comment-upvote'
                        })
                    })() : false
                }
    
                res.json({ ok: true })
            } else if (action === "delete") {
                let isDeleted = await deleteCommentVote({ feedbackDocID, voterStudentDocID })
                res.json({ ok: isDeleted.deleted || false })
            }
        } catch (error) {
            res.json({ ok: false })
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

                let isQuickPost = voteData["noteDocID"]["postType"] === 'quick-post'
                let upvoteCount = voteData["noteDocID"]["upvoteCount"]
    
                io.emit('update-upvote-dashboard', noteDocID, upvoteCount)
                io.to(noteDocID).emit('update-upvote', upvoteCount)
                
                if(_voterStudentID !== _ownerStudentID) {
                    let postTitle = (voteData["noteDocID"]["title"]?.slice(0, 20) || voteData["noteDocID"]["description"].slice(0, 20)) + '...'
                    upvoteCount % 5 === 0 || upvoteCount === 1 ? (async function() {
                        await NotificationSender(io, {
                            ownerStudentID: _ownerStudentID,
                            redirectTo: isQuickPost ? `/view/quick-post/${noteDocID}` : `/view/${noteDocID}`
                        }).sendNotification({
                            content: `Your post "${postTitle}" is making an impact! It just got ${upvoteCount} like${upvoteCount === 1 ? '' : 's'}.`,
                            event: 'notification-upvote'
                        })
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
