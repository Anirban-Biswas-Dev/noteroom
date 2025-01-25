import { Server } from "socket.io";
import { Router } from "express";
import { basename } from "path"
import Notes from "../schemas/notes.js";
import Students from "../schemas/students.js";
import archiver from "archiver";
import { getNotifications } from "../helpers/rootInfo.js";
import { addSaveNote, deleteNote, deleteSavedNote, getAllNotes } from "./noteService.js";
import { Convert } from "./userService.js";
import { isUpVoted } from "./voteService.js";
import { checkLoggedIn } from "../middlewares/checkLoggedIn.js";

const router = Router()

export default function apiRouter(io: Server) {
    // router.use(checkLoggedIn)

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


    router.delete("/note/delete/:noteDocID", async (req, res) => {
        let noteDocID = req.params.noteDocID
        let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
        let deleted = await deleteNote({ studentDocID, noteDocID })
        
        res.send({ deleted: deleted })
    })

    router.post("/note/save", async (req, res) => {
        try {
            let action = req.query["action"]
            let noteDocID = req.body["noteDocID"]
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
    
            if (action === 'save') {
                let result = await addSaveNote({ studentDocID, noteDocID })
                res.json({ ok: result.ok, count: result.count, savedNote: result.savedNote })
            } else {
                let result = await deleteSavedNote({ studentDocID, noteDocID })
                res.json({ ok: result.ok, count: result.count })
            }
        } catch (error) {
            res.json({ ok: false, count: undefined })
        }
    })


    router.get('/search', async (req, res, next) => {
        let searchTerm = req.query.q as string
        const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
        let notes = await Notes.find({ title: { $regex: regex } }, { title: 1 })
        res.json(notes)
    })

    router.get('/searchUser', async (req, res) => {
        if (req.query) {
            let term = req.query.term
            let students = await Students.aggregate([
                {
                    $match: {
                        displayname: { $regex: `^${term}`, $options: 'i' } // Ensure case-insensitive search
                    }
                },
                {
                    $project: {
                        displayname: 1,
                        username: 1,
                        profile_pic: 1,
                        _id: 0
                    }
                }
            ]);
    
            res.json(students)
        }
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
            
            let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
            let notes = await getAllNotes(studentDocID, { skip: skip, limit: count })

            if (notes.length != 0) {
                res.json(notes)
            } else {
                res.json([])
            }
        }
    })


    router.get('/getNotifs', async (req, res) => {
        let studentID = req.query.studentID?.toString()
        let notifs = await getNotifications(studentID)
        res.json(notifs)
    })
    

    return router
}