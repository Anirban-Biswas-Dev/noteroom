import { IFeedBackDB, IFeedbackNotificationDB, IMentionNotificationDB, IReplyDB } from './../types/database.types.js';
import { Router } from 'express'
import Students from '../schemas/students.js'
import { Server } from 'socket.io'
import { checkMentions } from '../helpers/utils.js'
import { getNotifications, getSavedNotes, profileInfo, unreadNotiCount } from '../helpers/rootInfo.js'
import { getNote, getOwner } from '../services/noteService.js'
import { Convert } from '../services/userService.js'
import { addFeedbackNoti, addMentionNoti } from '../services/notificationService.js'
import { addFeedback, addReply } from '../services/feedbackService.js'
import { IFeedBackNotification, IMentionNotification } from '../types/notificationService.type.js'
import { userSocketMap } from '../server.js';

const router = Router()

function noteViewRouter(io: Server) {
    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID
            let noteInformation = await getNote({noteDocID})
            let root = await profileInfo(req.session["stdid"])
            let [note, owner, feedbacks] = [noteInformation['note'], noteInformation['owner'], noteInformation['feedbacks']]
            let mynote: number; //* Varifing if a note is mine or not: corrently using for not allowing users to give feedbacks based on some situations (self-notes and viewing notes without being logged in)

            
            if (req.session["stdid"]) {
                if (noteDocID) {
                    //# Root information
                    let savedNotes = await getSavedNotes(req.session["stdid"])
                    let notis = await getNotifications(req.session["stdid"])
                    let unReadCount = await unreadNotiCount(req.session["stdid"])

                    if (note.ownerDocID == req.cookies['recordID']) {
                        mynote = 1
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

        const _commenterStudentID = req.body["commenterStudentID"]
        const commenterDocID = (await Convert.getDocumentID_studentid(_commenterStudentID)).toString()
        const _noteDocID = req.body["noteDocID"]
        const noteOwnerInfo = await getOwner({noteDocID: _noteDocID}) 
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString()
        let ownerSocketID = userSocketMap.get(_ownerStudentID)

        /**
        * @description - Feedback and Reply will have the same notification structure: `IFeedBackNotification`. Reply and Feedback are basically feedbacks
        * @param mainData - This is the mongoose comment document ( **feedback: addFeedback** | **reply: addReply** ) data got AFTER SAVING INTO DATABASE
        */
        //FIXME: feedback and mention notification sender are almost same, so I will optimize them more
        //FIXME: maybe the ownerStudentID when sending notification is not useful now, cause cookie checking is gone
        async function sendFeedbackNotification(mainData: any) {
            let notification_db: IFeedbackNotificationDB = {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                feedbackDocID: mainData._id.toString(),
                ownerStudentID: _ownerStudentID
            }
            let notidata = await addFeedbackNoti(notification_db)
            let commentNotification: IFeedBackNotification = {
                noteID: _noteDocID,
                nfnTitle: mainData["noteDocID"]["title"],
                isread: "false",
                commenterDisplayName: mainData["commenterDocID"]["displayname"],
                ownerStudentID: _ownerStudentID,
                notiID: notidata._id.toString(),
                feedbackID: notidata._id.toString()
            }
            io.to(ownerSocketID).emit('notification-feedback', commentNotification, "has given feedback on your notes! Check it out.")
        }


        /**
        * @description - It will take the usernames to mention. Then send the notification
        * @param mentions - A list of usernames to send mention notification
        * @param mainData - The mongoose comment document ( **feedback: addFeedback** | **reply: addReply** ) data got AFTER SAVING INTO DATABASE
        */
        async function sendMentionNotification(mentions: any, mainData: any) {
            if (mentions.length != 0) {
                let studentIDs = (await Students.find({ username: { $in: mentions } }, { studentID: 1 })).map(data => data.studentID)
                studentIDs.map(async studentID => {
                    let mentionNotification_db: IMentionNotificationDB = {
                        noteDocID: _noteDocID,
                        commenterDocID: commenterDocID.toString(),
                        feedbackDocID: mainData._id.toString(),
                        mentionedStudentID: studentID
                    }
                    let notidata = await addMentionNoti(mentionNotification_db)
                    let mentionNotification: IMentionNotification = {
                        noteID: _noteDocID,
                        nfnTitle: mainData["noteDocID"]["title"],
                        isread: "false",
                        commenterDisplayName: mainData["commenterDocID"]["displayname"],
                        mentionedStudentID: _ownerStudentID,
                        notiID: notidata._id.toString(),
                        feedbackID: notidata._id.toString(),
                        mention: true
                    }
                    io.to(userSocketMap.get(studentID)).emit("notification-mention", mentionNotification, "has mentioned you")
                })
            }
        }


        if(!req.body.reply) {
            let feedbackData: IFeedBackDB = {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                feedbackContents: req.body["feedbackContents"]
            }
            let feedback = await addFeedback(feedbackData) /* The extented-feedback document with commenter info */
            io.to(feedbackData.noteDocID).emit('add-feedback', feedback.toObject()) //* Adding feedback under the note view: Sending extented-feedback to all the users via websockets
        
            if (_ownerStudentID !== _commenterStudentID) {
                sendFeedbackNotification(feedback)
            }
    
    
            let mentions = checkMentions(feedbackData.feedbackContents)
            await sendMentionNotification(mentions, feedback)
            
        } else {
            let replyData: IReplyDB = {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                feedbackContents: req.body["replyContent"],
                parentFeedbackDocID: req.body["parentFeedbackDocID"],
            } 
            let reply = await addReply(replyData)
            io.to(replyData.noteDocID).emit('add-reply', reply.toObject())

            if(_ownerStudentID !== _commenterStudentID) {
                sendFeedbackNotification(reply)
            }

            let mentions = checkMentions(replyData.feedbackContents)
            await sendMentionNotification(mentions, reply)
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
