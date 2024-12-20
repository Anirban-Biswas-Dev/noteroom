import {
    IFeedBackDB,
    IFeedbackNotificationDB,
    IMentionNotificationDB,
    IReplyDB,
    IReplyNotificationDB
} from './../types/database.types.js';
import {Router} from 'express'
import Students from '../schemas/students.js'
import {Server} from 'socket.io'
import {checkMentions} from '../helpers/utils.js'
import {getNotifications, getSavedNotes, profileInfo, unreadNotiCount} from '../helpers/rootInfo.js'
import {getNote, getOwner} from '../services/noteService.js'
import {Convert} from '../services/userService.js'
import {addFeedbackNoti, addMentionNoti, addReplyNoti} from '../services/notificationService.js'
import {addFeedback, addReply} from '../services/feedbackService.js'
import {
    ENotificationType,
    IFeedBackNotification,
    IMentionNotification,
    IReplyNotification
} from '../types/notificationService.type.js'
import {userSocketMap} from '../server.js';

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
         * @param notificationType - The type of notification (currently `reply` or `feedback`)
         * @param baseDocument - This is the extented notification document given by the service after saving it in the database. This is used for creating notification object that will be sent via WS
         */
        async function sendCommentNotification(notificationType: ENotificationType, baseDocument: any) {
            let baseData = {
                noteDocID: _noteDocID,
                feedbackDocID: baseDocument._id.toString()
            }

            let baseNotificationData = Object.assign(baseData, {
                isread: "false",
                nfnTitle: baseDocument["noteDocID"]["title"],
                commenterDisplayName: baseDocument["commenterDocID"]["displayname"],
                feedbackID: baseDocument._id.toString()
            })

            switch (notificationType) {
                case ENotificationType.Feedback:
                    let feedback_notification_db: IFeedbackNotificationDB = {...baseData,
                            commenterDocID: commenterDocID,
                            ownerStudentID: _ownerStudentID
                    }
                    let feedback_notidata = await addFeedbackNoti(feedback_notification_db)
                    let feedback_notification: IFeedBackNotification = {...baseNotificationData,
                        notiID: feedback_notidata._id.toString(),
                        ownerStudentID: _ownerStudentID,
                        noteID: _noteDocID
                    }
                    io.to(ownerSocketID).emit('notification-feedback', feedback_notification, "has given feedback on your notes! Check it out.")
                    break

                case ENotificationType.Reply:
                    let reply_notification_db: IReplyNotificationDB = {...baseData,
                            commenterDocID: baseDocument["commenterDocID"]._id.toString(),
                            ownerStudentID: baseDocument["parentFeedbackDocID"]["commenterDocID"].studentID.toString(),
                            parentFeedbackDocID: baseDocument["parentFeedbackDocID"]._id.toString()
                    }
                    let reply_notidata = await addReplyNoti(reply_notification_db)
                    let reply_notification: IReplyNotification = {...baseNotificationData,
                        notiID: reply_notidata._id.toString(),
                        ownerStudentID: _ownerStudentID,
                        noteID: _noteDocID
                    }

                    io.to(userSocketMap.get(reply_notification_db.ownerStudentID)).emit("notification-reply", reply_notification, "replied to your comment")
                    break
            }

        }


        /**
        * @description - It will take the usernames to mention. Then send the notification
        * @param mentions - A list of usernames to send mention notification
        * @param mainData - The mongoose comment document ( **feedback: addFeedback** | **reply: addReply** ) data got AFTER SAVING INTO DATABASE
        */
        async function sendMentionNotification(mentions: string[], mainData: any) {
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
                        feedbackID: mainData._id.toString(),
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
                await sendCommentNotification(ENotificationType.Feedback, feedback)
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
                await sendCommentNotification(ENotificationType.Feedback, reply)
                await sendCommentNotification(ENotificationType.Reply, reply)
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
