import { Router } from 'express'
import Notes from '../schemas/notes.js'
import { upload } from '../services/firebaseService.js'
import { Server } from 'socket.io'
import { addNote } from '../services/noteService.js'
import { getNotifications, getSavedNotes, profileInfo, unreadNotiCount } from '../helpers/rootInfo.js'
import { INoteDB } from '../types/database.types.js'
import { compressImage } from '../helpers/utils.js'
import fileUpload from 'express-fileupload'
import { userSocketMap } from '../server.js'
import { NotificationSender } from '../services/io/ioNotifcationService.js'
const router = Router()


function uploadRouter(io: Server) {
    router.get('/', async (req, res) => {
        if (req.session["stdid"]) {
            let student = await profileInfo(req.session["stdid"])
            let savedNotes = await getSavedNotes(req.session["stdid"])
            let notis = await getNotifications(req.session["stdid"])
            let unReadCount = await unreadNotiCount(req.session["stdid"])
            res.render('upload-note', { root: student, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount })
        } else {
            res.redirect('/login')
        }
    })

    router.post('/', async (req, res, next) => {
        try {
            if (!req.files) {
                res.send({ error: 'No files have been selected to publish' })
            } else {
                let noteData: INoteDB = {
                    ownerDocID: req.cookies['recordID'],
                    subject: req.body['noteSubject'],
                    title: req.body['noteTitle'],
                    description: req.body['noteDescription']
                } //* All the data except the notes posted by the client

                res.send({ ok: true })

                let note = await addNote(noteData) //* Adding all the record of a note except the content links in the database
                let noteDocId = note._id

                let fileObjects = <fileUpload.UploadedFile[]>Object.values(req.files) //* Getting all the file objects from the requests
                let compressedFileObjects = fileObjects.map(file => compressImage(file))
                let allFiles = await Promise.all(compressedFileObjects)


                let allFilePaths = [] //* These are the raw file paths that will be directly used in the note-view

                for (const file of allFiles) {
                    let publicUrl = (await upload(file, `${req.cookies['recordID']}/${noteDocId.toString()}/${file["name"]}`)).toString()
                    allFilePaths.push(publicUrl)
                }

                await Notes.findByIdAndUpdate(noteDocId, { $set: { content: allFilePaths, completed: true } }) //* After adding everything into the note-db except content (image links), this will update the content field with the image links
                let completedNoteData = await Notes.findById(noteDocId)

                await NotificationSender(io, {
                    ownerStudentID: req.session["stdid"],
                }).sendNoteUploadConfirmationNotification(completedNoteData, 'success')


                let owner = await profileInfo(req.session["stdid"]) //* Getting the user information, basically the owner of the note
                io.emit('note-upload', { //* Handler 1: Dashboard; for adding the note at feed via websockets
                    noteID /* Document ID of the note */: noteDocId,
                    thumbnail /* The first image of the notes content as a thumbnail */: allFilePaths[0],
                    profile_pic /* Profile pic path of the owner of the note */: owner.profile_pic,
                    noteTitle /* Title of the note */: noteData.title,
                    feedbackCount: 0, //! maybe this needs to be dynamic
                    ownerDisplayName /* Displayname of the owener of the note*/: owner.displayname,
                    ownerID /* Student ID of the owner of the note */: owner.studentID,
                    ownerUserName /* Username of the owner of the note */: owner.username,
                    upvoteCount: 0
                })
            }
        } catch (error) {
            if (error.errors && error.errors['title'] && error.errors.title['kind'] === 'maxlength') {
                let errorField = error.errors.title['path']
                io.emit('note-validation', { errorField })
            } else {
                //CRITICAL: handle the note upload failure
                res.send({ error: error.message })
                next(error)
            }
        }
    })

    return router
}

export default uploadRouter
