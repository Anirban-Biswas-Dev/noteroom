import { Router } from 'express'
import Notes from '../schemas/notes.js'
import { Server } from 'socket.io'
import { addNote, deleteNote } from '../services/noteService.js'
import { getNotifications, getSavedNotes, profileInfo, unreadNotiCount } from '../helpers/rootInfo.js'
import { INoteDB } from '../types/database.types.js'
import { log, processBulkCompressUpload } from '../helpers/utils.js'
import { NotificationSender } from '../services/io/ioNotifcationService.js'
import { Convert } from '../services/userService.js'
const router = Router()


function uploadRouter(io: Server) {
    async function handleNoteUploadFailure(noteDocId: any, studentID: any, noteTitle: any, studentDocID: any) {
        if (noteDocId) {
            await deleteNote({ studentDocID: studentDocID, noteDocID: noteDocId })
        }
        await NotificationSender(io, {
            ownerStudentID: studentID
        }).sendNotification({
            content: `Your note '${noteTitle}' couldn't be uploaded successfully!`,
            event: 'notification-note-upload-failure'
        })   
    }


    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let student = await profileInfo(req.session["stdid"])
            let savedNotes = await getSavedNotes(req.session["stdid"])
            let notis = await getNotifications(req.session["stdid"])
            let unReadCount = await unreadNotiCount(req.session["stdid"])
            res.render('upload-note', { root: student, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount })
            log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: redirected to upload.`)
        } else {
            res.redirect('/login')
        }
    })

    router.post('/', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"]
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
    
            if (!req.files) {
                return res.send({ ok: false, message: 'No files have been selected to publish' })
            }

            let noteDocId: any;
            let noteTitle = req.body['noteTitle'] || "Note Title"

            try {
                let noteData: INoteDB = {
                    ownerDocID: studentDocID,
                    subject: req.body['noteSubject'],
                    title: req.body['noteTitle'],
                    description: req.body['noteDescription']
                }

                let note = await addNote(noteData)
                noteDocId = note._id
                
                res.send({ ok: true })
                log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Primary notedata added and ok=true sent.`)

                ;(async function() {
                    try {
                        let allFilePaths = await processBulkCompressUpload(req.files, studentDocID, noteDocId)
                        log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Bulk processing is completed of note images`)
    
                        await Notes.findByIdAndUpdate(noteDocId, { $set: { content: allFilePaths, completed: true } }) 
                        log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Note images' list in added in the note document`)

                        let completedNoteData = await Notes.findById(noteDocId)
        
                        await NotificationSender(io, {
                            ownerStudentID: studentID,
                            redirectTo: `/view/${noteDocId}`
                        }).sendNotification({
                            content: `Your note '${completedNoteData["title"]}' is successfully uploaded!`,
                            event: 'notification-note-upload-success'
                        })
                        log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Note upload success notification sent`)
        
                        try {
                            let owner = await profileInfo(req.session["stdid"]) 
                            io.emit('note-upload', { 
                                noteID /* Document ID of the note */: noteDocId,
                                noteTitle /* Title of the note */: noteData.title,
                                description: noteData.description,
                                createdAt: note.createdAt,
            
                                content1: allFilePaths[0],
                                content2: allFilePaths[1],
                                contentCount /* The first image of the notes content as a thumbnail */: allFilePaths.length,
                                
                                ownerID /* Student ID of the owner of the note */: owner.studentID,
                                profile_pic /* Profile pic path of the owner of the note */: owner.profile_pic,
                                ownerDisplayName /* Displayname of the owener of the note*/: owner.displayname,
                                ownerUserName /* Username of the owner of the note */: owner.username,
            
                                isSaved: false,
                                isUpvoted: false,
                                feedbackCount: 0, 
                                upvoteCount: 0,
            
                                quickPost: false
                            })
                            log('info', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: note-upload event is sent`)
                        } catch (error) {
                            log('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: note-upload event sent failure, abort: ${error.message}`)
                        }
                    } catch (error) {
                        log('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Error processing file upload. Primary data will be deleted: ${error.message}`)
                        handleNoteUploadFailure(noteDocId, studentID, noteTitle, studentDocID)
                        log('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Note upload failure notification is sent`)
                    }
                })()
    
            } catch (error) {
                log('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Error processing file upload. Primary data will be deleted: ${error.message}`)
                handleNoteUploadFailure(noteDocId, studentID, noteTitle, studentDocID)
                log('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Note upload failure notification is sent`)
            }
        } catch (error) {
            log('error', `On /upload StudentID=${req.session['stdid'] || "--studentid--"}: Error on note upload request processing: ${error.message}`)
            res.json({ ok: false, kind: 500 })
        }
    })

    return router
}

export default uploadRouter
