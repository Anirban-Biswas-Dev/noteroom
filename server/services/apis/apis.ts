import { Server } from "socket.io";
import { Router } from "express";
import { basename } from "path"
import Notes from "../../schemas/notes.js";
import Students from "../../schemas/students.js";
import archiver from "archiver";
import { getNotifications } from "../../helpers/rootInfo.js";
import { getAllNotes } from "../noteService.js";
import { Convert, deleteAccount, deleteSessionsByStudentID } from "../userService.js";
import { checkLoggedIn } from "../../middlewares/checkLoggedIn.js";
import noteRouter from "./note.js";
import searchRouter from "./search.js";
import { requestApi } from "./request.js";

export const router = Router()

export default function apiRouter(io: Server) {
    // router.use(checkLoggedIn)
    router.use('/note', noteRouter(io))
    router.use('/search', searchRouter(io))
    router.use('/request', requestApi(io))

    router.get('/notifs', async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let notifs = await getNotifications(studentID)
            res.json({ objects: notifs })
        } catch (error) {
            res.json({ objects: [] })
        }
    })

    router.post("/download" ,async (req, res) => {
        let noteID = req.body.noteID
        let noteTitle = req.body.noteTitle

        const noteLinks = (await Notes.findById(noteID, { content: 1 })).content

        res.setHeader('Content-Type', 'application/zip');

        const sanitizeFilename = (filename: string) => {
            return filename.replace(/[^a-zA-Z0-9\.\-\_]/g, '_'); // Replace any invalid characters with an underscore
        }
        res.setHeader('Content-Disposition', `attachment; filename=${sanitizeFilename(noteTitle)}.zip`);

        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.pipe(res);

        for (let imageUrl of noteLinks) {
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${imageUrl}: ${response.statusText}`);
                }

                let arrayBuffer = await response.arrayBuffer()
                let buffer = Buffer.from(arrayBuffer)

                let fileName = basename(new URL(imageUrl).pathname);
                archive.append(buffer, { name: fileName });
            } catch (err) {
                console.error(`Error fetching image: ${err.message}`);
                return;
            }
        }
        archive.finalize();
    })


    router.get('/getnote', async (req, res, next) => {
        let type = req.query.type
        async function getSavedNotes(studentDocID) {
            let student = await Students.findById(studentDocID, { saved_notes: 1 })
            let saved_notes_ids = student['saved_notes']
            let notes = await Notes.aggregate([
                { $match: { _id: { $in: saved_notes_ids } } },
                { $project: {
                    title: 1,
                    thumbnail: { $first: '$content' }
                } }
            ])
            return notes
        }

        if (type === 'save') {
            let studentDocID = await Convert.getDocumentID_studentid(req.session["stdid"])
            let savedNotes = await getSavedNotes(studentDocID)
            res.json(savedNotes)
        } else if (type === 'seg') {
            let page = req.query.page as unknown as number
            let count = req.query.count as unknown as number
            let skip: number = (page - 1) * count
            let seed: number = req.query.seed as unknown as number
            
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
            let notes = await getAllNotes(studentDocID, { skip: skip, limit: count, seed: seed })
            
            if (notes.length != 0) {
                res.json(notes)
            } else {
                res.json([])
            }
        }
    })


    router.get('/user/delete', async (req, res) => {
        try {
            let studentID = req.query["studentID"] || req.session["stdid"]
            let studentFolder = req.query["studentFolder"]
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let response = await deleteAccount(studentDocID, studentFolder === "true")
            let sessiondeletion = await deleteSessionsByStudentID(studentID)

            console.log(`User got deleted`)

            res.json({ ok: response.ok && sessiondeletion.ok })
        } catch (error) {
            res.json({ ok: false })
        }
    })    

    return router
}