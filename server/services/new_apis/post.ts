import { Router } from "express";
import { Server } from "socket.io";
import { addSaveNote, deleteSavedNote, getSavedPosts, getSingleNote } from "../noteService";
import { Convert } from "../userService";
import { addFeedback, addReply, getComments } from "../feedbackService";
import addVote, { deleteVote } from "../voteService";

const router = Router()
export default function postApiRouter(io: Server) {

    router.get("/:postID/metadata", async (req, res) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let response: any = await getSingleNote(req.params.postID, studentDocID, { images: false })
            if (response.ok) {
                res.json({ ok: true, noteData: response.noteData })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.get("/:postID/images", async (req, res) => {
        try {
            let response: any = await getSingleNote(req.params.postID, null, { images: true })
            if (response.ok) {
                res.json({ ok: true, images: response.images })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.get("/:postID/comments", async (req, res) => {
        try {
            let postID = req.params.postID
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d")).toString()
            let response = await getComments({ noteDocID: postID, studentDocID })
            if (response.ok) {
                res.json({ ok: true, comments: response.comments })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.put("/:postID/save", async (req, res) => {
        try {
            let postID = req.params.postID
            let action = <"save" | "delete">req.query["action"]
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d")).toString()
    
            if (action === 'save') {
                let response = await addSaveNote({ studentDocID, noteDocID: postID })
                res.json({ ok: response.ok })
            } else {
                let response = await deleteSavedNote({ studentDocID, noteDocID: postID })
                res.json({ ok: response.ok })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })
    
    //TODO: not implemented
    router.delete("/:postID/delete", async (req, res) => {

    })

    router.post("/:postID/feedbacks", async (req, res) => {
        try {
            const postID = req.params.postID
            const studentID = req.session["stdid"] || req.body.commenter
            const feedbackContent = req.body.feedbackContent
            const commenterDocID = (await Convert.getDocumentID_studentid(studentID)).toString()

            const feedbackData = {
                noteDocID: postID,
                commenterDocID: commenterDocID,
                feedbackContents: feedbackContent
            }
            const response = await addFeedback(feedbackData)
            if (response.ok) {
                res.json({ ok: true, feedback: response.feedback })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.post("/:postID/feedbacks/:feedbackID/replies", async (req, res) => {
        try {
            const postID = req.params.postID
            const studentID = req.session["stdid"] || req.body.replier
            const replyContent = req.body.replyContent
            const parentFeedbackDocID = req.params.feedbackID 
            const replierDocID = (await Convert.getDocumentID_studentid(studentID)).toString()

            const replyData = {
                noteDocID: postID,
                feedbackContents: replyContent,
                commenterDocID: replierDocID,
                parentFeedbackDocID: parentFeedbackDocID
            }
            const response = await addReply(replyData)
            if (response.ok) {
                res.json({ ok: true, reply: response.reply })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: true })
        }
    })

    router.post("/:postID/vote", async (req, res) => {
        try {
            const postID = req.params.postID
            const action = req.query["action"]
            const voterStudentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
            const voterStudentDocID = (await Convert.getDocumentID_studentid(voterStudentID)).toString()
            const voteType = <"upvote" | "downvote">req.query["type"]
            
            if (!action) {
                let response = await addVote({ voteType, noteDocID: postID, voterStudentDocID: voterStudentDocID })
                res.json({ ok: response.ok })
            } else {
                let response = await deleteVote({ noteDocID: postID, voterStudentDocID })
                res.json({ ok: response.ok })
            }

        } catch (error) {
            res.json({ ok: false })
        }
    })

    router.get("/saved", async (req, res) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
            let response = await getSavedPosts(studentID)
            if (response.ok) {
                res.json({ ok: true, posts: response.posts })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}
