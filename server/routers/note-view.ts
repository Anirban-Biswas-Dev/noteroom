import { IFeedBackDB, IFeedbackNotificationDB, IMentionNotificationDB } from './../types/database.types.js';
import { Router } from 'express'
import Students from '../schemas/students.js'
import { Server } from 'socket.io'
import { checkMentions } from '../helpers/utils.js'
import { getNotifications, getSavedNotes, profileInfo, unreadNotiCount } from '../helpers/rootInfo.js'
import { getNote, getOwner } from '../services/noteService.js'
import { Convert } from '../services/userService.js'
import { addFeedbackNoti, addMentionNoti } from '../services/notificationService.js'
import { addFeedback } from '../services/feedbackService.js'
import { IFeedBackNotification } from '../types/notificationService.type.js'

const router = Router()

function noteViewRouter(io: Server) {
    io.on('connection', (socket) => {        
        socket.on('join-room', (room: string) => {
            socket.join(room)
        })
    })

    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID
            let noteInformation = await getNote({noteDocID})
            let root = await profileInfo(req.session["stdid"])
            let [note, owner, feedbacks] = [noteInformation['note'], noteInformation['owner'], noteInformation['feedbacks']]
            let mynote = 1 //* Varifing if a note is mine or not: corrently using for not allowing users to give feedbacks based on some situations (self-notes and viewing notes without being logged in)

            if (req.session["stdid"]) {
                if (noteDocID) {
                    //# Root information
                    let savedNotes = await getSavedNotes(req.session["stdid"])
                    let notis = await getNotifications(req.session["stdid"])
                    let unReadCount = await unreadNotiCount(req.session["stdid"])

                    if (note.ownerDocID == req.cookies['recordID']) {
                        res.render('note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount }) // Specific notes: visiting my notes
                    } else {
                        mynote = 0
                        res.render('note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount }) // Specific notes: visiting others notes
                    }
                }
            } else {
                mynote = 3 // Non-sessioned users
                res.render('note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: owner }) // Specific notes: visiting notes without being logged in
            }
        } catch (error) {
            next(error)
        }
    })


    router.post('/:noteID/postFeedback', async (req, res) => {
        //# First save-send the feedback
        let commenterDocID = (await Convert.getDocumentID_studentid(req.body["commenterStudentID"])).toString()
        let feedbackData: IFeedBackDB = {
            noteDocID: req.body["noteDocID"],
            commenterDocID: commenterDocID,
            feedbackContents: req.body["feedbackContents"]
        }
        let feedback = await addFeedback(feedbackData) /* The extented-feedback document with commenter info */
        io.to(feedbackData.noteDocID).emit('add-feedback', feedback.toObject()) //* Adding feedback under the note view: Sending extented-feedback to all the users via websockets



        let _noteDocID = feedbackData.noteDocID
        let noteOwnerInfo = await getOwner({noteDocID: _noteDocID}) 
        let _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString()


        //# Then create-save-send the feedback notification
        let feedbackNotification_db: IFeedbackNotificationDB = {
            noteDocID: _noteDocID,
            commenterDocID: commenterDocID.toString(),
            feedbackDocID: feedback._id.toString(),
            ownerStudentID: _ownerStudentID
        }
        let feedbackNoti = await addFeedbackNoti(feedbackNotification_db)
        let feedbackNotification: IFeedBackNotification = { //* Feedback-notifications: This will go to everyuser, but the user with ownerUsername=recordName will keep it
            noteID : _noteDocID,
            nfnTitle : feedback["noteDocID"]["title"],
            isread: "false",
            commenterDisplayName: feedback["commenterDocID"]["displayname"],
            ownerStudentID : _ownerStudentID,
            notiID: feedbackNoti._id.toString(),
            feedbackID : feedback._id.toString()
        }
        io.emit('notification-feedback', feedbackNotification)



        //# Lastly check-create-send mention notification
        let mentions = checkMentions(feedbackData.feedbackContents)
        if (mentions.length != 0) {
            let studentIDs = (await Students.find({ username: { $in: mentions } }, { studentID: 1 })).map(data => data.studentID)
            studentIDs.map(async studentID => {
                let mentionNotification: IMentionNotificationDB = {
                    noteDocID: _noteDocID,
                    commenterDocID: commenterDocID.toString(),
                    feedbackDocID: feedback._id.toString(),
                    mentionedStudentID: studentID
                }
                await addMentionNoti(mentionNotification)
            })
        }
    })

    router.get('/:noteID/shared', async (req, res, next) => {
        let headers = req.headers['user-agent']
        let noteDocID = req.params.noteID
        let note = (await getNote({noteDocID})).note

        if (headers.includes('facebook')) {
            res.render('shared', { note: note, req: req })
        } else {
            res.redirect(`/view/${noteDocID}`)
        }
    })

    return router
}

export default noteViewRouter
