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
import userApiRouter from "./user.js";
import { log } from "../../helpers/utils.js";
import { deleteAllNoti } from "../notificationService.js";

export const router = Router()

export default function apiRouter(io: Server) {
    // router.use(checkLoggedIn)
    router.use('/note', noteRouter(io))
    router.use('/search', searchRouter(io))
    router.use('/request', requestApi(io))
    router.use('/user', userApiRouter(io))

    router.get('/notifs', async (req, res) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
            let notifs = await getNotifications(studentID)
            res.json({ objects: notifs })
        } catch (error) {
            res.json({ objects: [] })
        }
    })

    router.post("/download" ,async (req, res) => {
        try {
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
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${imageUrl}: ${response.statusText}`);
                }
    
                let arrayBuffer = await response.arrayBuffer()
                let buffer = Buffer.from(arrayBuffer)
    
                let fileName = basename(new URL(imageUrl).pathname);
                archive.append(buffer, { name: fileName });
            }
            archive.finalize();
            log('info', `On /download StudentID=${req.session["stdid"] || "--studentid--"}: Downloaded note ${req.body.noteID || '--noteid--'}`)
        } catch (error) {
            log('error', `On /download StudentID=${req.session["stdid"] || "--studentid--"}: Couldn't download note ${req.body.noteID || '--noteid--'}`)
            res.json({ ok: false })
        }
    })


    router.get('/getnote', async (req, res, next) => {
        try {
            const count = 7
            let page = Number(req.query.page) || 1
            let seed: number = Number(req.query.seed) || 601914080
            let skip: number = (page - 1) * count
            let after: string | undefined = req.query.after ? String(req.query.after) : undefined
            
            let _studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"))
            let studentDocID: any
            if (_studentDocID) {
                studentDocID = _studentDocID.toString()
                log('info', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: Converted studentID->documentID`)

                let notes = await getAllNotes(studentDocID, { skip: skip, limit: count, seed: seed, after: after })
                log('info', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: Got notes with skip=${skip}, limit=${count}, seed=${seed}`)
                
                if (notes.length != 0) {
                    log('info', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: Sent notes with skip=${skip}, limit=${count}, seed=${seed}`)
                    res.json(notes)
                } else {
                    log('info', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: No notes left`)
                    res.json([])
                }
            } else {
                log('error', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: Conversion studentID->documentID failed`)
                res.json([])
            }
        } catch (error) {
            log('error', `On /getnote StudentID=${req.session["stdid"] || "--studentid--"}: ${error.message}`)
            res.json([])
        }
    })


    router.get('/user/delete', async (req, res) => {
        try {
            let studentID = req.query["studentID"] || req.session["stdid"]
            let studentFolder = req.query["studentFolder"]
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let response = await deleteAccount(studentDocID, studentFolder === "true")
            let sessiondeletion = await deleteSessionsByStudentID(studentID)

            log('info', `On /user/delete StudentID=${studentID || "--studentid--"}: User is deleted`)

            res.json({ ok: response.ok && sessiondeletion.ok })
        } catch (error) {
            res.json({ ok: false })
        }
    })    


    router.delete('/notifications/delete', async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let deletedResult = await deleteAllNoti(studentID)
            res.json({ ok: deletedResult })
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}