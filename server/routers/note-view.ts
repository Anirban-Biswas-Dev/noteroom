import {
    IFeedBackDB,
    IReplyDB} from './../types/database.types.js';
import {Router} from 'express'
import Students from '../schemas/students.js'
import {Server} from 'socket.io'
import {checkMentions, replaceMentions} from '../helpers/utils.js'
import {getNotifications, getSavedNotes, profileInfo, unreadNotiCount} from '../helpers/rootInfo.js'
import {getNote, getOwner} from '../services/noteService.js'
import {Convert} from '../services/userService.js'
import {addFeedback, addReply} from '../services/feedbackService.js'
import addVote, { deleteVote } from '../services/voteService.js';
import { NotificationSender } from '../services/io/ioNotifcationService.js';
import NoteVotes from '../schemas/votes.js';

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
                    
                    let studentDocID = await Convert.getDocumentID_studentid(req.session["stdid"])
                    let upvote_doc = await NoteVotes.findOne({ $and: [ { noteDocID: noteDocID }, { voterStudentDocID: studentDocID } ] })
                    let isUpvoted = upvote_doc ? true : false

                    if (note.ownerDocID == req.cookies['recordID']) {
                        mynote = 1
                        res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount, isUpvoted }) // Specific notes: visiting my notes
                    } else {
                        mynote = 0
                        res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount, isUpvoted }) // Specific notes: visiting others notes
                    }
                }
            } else {
                mynote = 3 // Non-sessioned users
                res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: owner }) // Specific notes: visiting notes without being logged in
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

        
        async function replaceFeedbackText(feedbackText: string) {
            let mentions = checkMentions(feedbackText)

            if (mentions.length !== 0) {
                let displayNames = (await Students.find({ username: { $in: mentions } }, { displayname: 1 })).map(data => data.displayname.toString()).reverse()
                return replaceMentions(feedbackText, displayNames)
            } else {
                return feedbackText
            }
        }

        
        if(!req.body["reply"]) {
            let _feedbackContents = req.body["feedbackContents"]
            let feedbackData: IFeedBackDB = {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                feedbackContents: await replaceFeedbackText(_feedbackContents)
            }
            let feedback = await addFeedback(feedbackData)
            io.to(feedbackData.noteDocID).emit('add-feedback', feedback.toObject())
            
            if (_ownerStudentID !== _commenterStudentID) {
                await NotificationSender(io, {
                    ownerStudentID: _ownerStudentID,
                    noteDocID: _noteDocID,
                    commenterDocID: commenterDocID
                }).sendFeedbackNotification(feedback)
            }
    
            let mentions = checkMentions(_feedbackContents)
            await NotificationSender(io, { 
                noteDocID: _noteDocID, 
                commenterDocID: commenterDocID,
                commenterStudentID: _commenterStudentID
            }).sendMentionNotification(mentions, feedback)
            
        } else {
            let _replyContent = req.body["replyContent"]

            let replyData: IReplyDB = {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                feedbackContents: await replaceFeedbackText(_replyContent),
                parentFeedbackDocID: req.body["parentFeedbackDocID"],
            } 
            let reply = await addReply(replyData)
            io.to(replyData.noteDocID).emit('add-reply', reply.toObject())

            if(_commenterStudentID !== reply["parentFeedbackDocID"]["commenterDocID"].studentID) {
                await NotificationSender(io, { 
                    noteDocID: _noteDocID, 
                }).sendReplyNotification(reply)
            }

            let _mentions = checkMentions(_replyContent)
            let mentions = _mentions[0] === reply["parentFeedbackDocID"]["commenterDocID"].username ? _mentions.slice(1) : _mentions
            // This means, if you are repling someone's feedback, the feedbacker won't get a redundant mention notification, but they will get a reply notification

            await NotificationSender(io, { 
                noteDocID: _noteDocID, 
                commenterDocID: commenterDocID,
                commenterStudentID: _commenterStudentID
            }).sendMentionNotification(mentions, reply)
        }
    })

    router.post('/:noteID/vote', async (req, res) => {
        const _noteDocID = req.params.noteID
        const noteOwnerInfo = await getOwner({noteDocID: _noteDocID}) 
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString()
        
        const action = req.query["action"]

        let voteType = <"upvote" | "downvote">req.query["type"]
        let noteDocID = req.body["noteDocID"]
        let _voterStudentID = req.body["voterStudentID"]
        let voterStudentDocID = (await Convert.getDocumentID_studentid(_voterStudentID)).toString()

        //FIXME: check if a user has voted a note or not. though frontend js ensures that but it can be changed via any proxy by bypassing the frontend logic.
        try {
            if (!action) {
                let voteData = await addVote({ voteType, noteDocID, voterStudentDocID })
                let upvoteCount = voteData["noteDocID"]["upvoteCount"]
    
                io.emit('increment-upvote-dashboard', noteDocID)
                io.to(noteDocID).emit('increment-upvote')
                
                if(_voterStudentID !== _ownerStudentID) {
                    upvoteCount % 5 === 0 || upvoteCount === 1 ? (async function() {
                        await NotificationSender(io, {
                            upvoteCount: upvoteCount,
                            noteDocID: noteDocID,
                            ownerStudentID: _ownerStudentID,
                            voterStudentDocID: voterStudentDocID
                        }).sendVoteNotification(voteData)
                    })() : false
                }
                            
                res.json({ok: true})
                    
            } else {
                await deleteVote({ noteDocID, voterStudentDocID, voteType })
                io.emit('decrement-upvote-dashboard', noteDocID)
                io.to(noteDocID).emit('decrement-upvote')

                res.json({ ok: true })
            }
        } catch (error) {
            res.json({ ok: false })
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
