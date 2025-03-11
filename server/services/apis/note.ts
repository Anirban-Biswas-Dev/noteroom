import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../userService";
import { addSaveNote, deleteNote, deleteSavedNote, getNote, getSingleNote } from "../noteService";
import { manageProfileNotes } from "../noteService";
import notesModel from "../../schemas/notes";

const router = Router()

export default function noteRouter(io: Server) {
    router.get('/', async (req, res) => {
        try {
            let username = <string>req.query["username"] || await Convert.getUserName_studentid(req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d")
            let studentID = await Convert.getStudentID_username(username)
            let noteType = <"saved" | "owned">req.query["noteType"]
            let isCount = req.query["count"] ? true : false
            let isOwner = req.session["stdid"] === studentID
            
            if (!isCount) {
                let notes = await manageProfileNotes.getNote(noteType, studentID)
                res.json({ objects: notes, isOwner})
            } else {
                let noteCount = await manageProfileNotes.getNoteCount(noteType, studentID)
                res.json({ noteType, count: noteCount })
            }
        } catch (error) {
            res.json({ objects: [] })
        }
    })

    router.get('/:noteID/metadata', async (req, res) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let noteData: any = await getSingleNote(req.params.noteID, studentDocID)
            if (!noteData.ok) {
                res.json({ ok: true, noteData })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })
    router.get('/:noteID/images', async (req, res) => {
        try {
            let images: any = await getNote({ noteDocID: req.params.noteID, studentDocID: undefined }, true)
            if (!images.error) {
                res.json({ ok: true, images })
            } else {
                res.json({ ok: false })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })
    

    router.delete("/delete/:noteDocID", async (req, res) => {
        let noteDocID = req.params.noteDocID
        let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
        let deleted = await deleteNote({ studentDocID, noteDocID })
        
        res.send({ deleted: deleted })
    })

    router.post("/save", async (req, res) => {
        try {
            let action = req.query["action"]
            let noteDocID = req.body["noteDocID"]
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d")).toString()
            console.log([noteDocID, studentDocID, action])
    
            if (action === 'save') {
                let result = await addSaveNote({ studentDocID, noteDocID })
                console.log(`saved`)
                res.json({ ok: result.ok, count: result.count, savedNote: result.savedNote })
            } else {
                let result = await deleteSavedNote({ studentDocID, noteDocID })
                console.log(`deleted`)
                res.json({ ok: result.ok, count: result.count })
            }
        } catch (error) {
            res.json({ ok: false, count: undefined })
        }
    })


    /* Admin privilege */
    router.post('/pin', async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            if (studentID !== "0511f9b4-5282-450c-a3e5-220129585b8b") {
                res.json({ ok: false })
            } else {
                let noteDocID = req.body["noteID"]
                let changeTo = req.body["changeTo"] === "true" ? true : false
                let updateResult = await notesModel.updateOne({ _id: noteDocID }, { pinned: changeTo })
                res.json({ ok: updateResult.modifiedCount !== 0 })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })


    return router;
}