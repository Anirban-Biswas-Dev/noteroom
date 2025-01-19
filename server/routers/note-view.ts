import {
    IFeedBackDB,
    IReplyDB} from './../types/database.types.js';
import {Router} from 'express'
import Students from '../schemas/students.js'
import {Server} from 'socket.io'
import {checkMentions, replaceMentions} from '../helpers/utils.js'
import {getNotifications, getSavedNotes, profileInfo, unreadNotiCount} from '../helpers/rootInfo.js'
import {getNote, getOwner, isSaved} from '../services/noteService.js'
import {Convert} from '../services/userService.js'
import {addFeedback, addReply, getReply} from '../services/feedbackService.js'
import addVote, { addCommentVote, deleteCommentVote, deleteVote, isUpVoted } from '../services/voteService.js';
import { NotificationSender } from '../services/io/ioNotifcationService.js';
import { replyModel } from '../schemas/comments.js';

const router = Router()
function noteViewRouter(io: Server) {
    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID
            let mynote: number; //* Varifing if a note is mine or not: corrently using for not allowing users to give feedbacks based on some situations (self-notes and viewing notes without being logged in)

            
            if (req.session["stdid"]) {
                let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()

                if (noteDocID) {
                    let noteInformation = await getNote({noteDocID, studentDocID})
                    let [note, owner, feedbacks] = [noteInformation['note'], noteInformation['owner'], noteInformation['feedbacks']]

                    //# Root information
                    let root = await profileInfo(req.session["stdid"]) 
                    let savedNotes = await getSavedNotes(req.session["stdid"])
                    let notis = await getNotifications(req.session["stdid"])
                    let unReadCount = await unreadNotiCount(req.session["stdid"])
                    
                    let isUpvoted = await isUpVoted({ noteDocID: noteDocID, voterStudentDocID: studentDocID, voteType: 'upvote' })
                    let issaved = await isSaved({ noteDocID, studentDocID })

                    if (note.ownerDocID == req.cookies['recordID']) {
                        mynote = 1
                        res.render('note-view/note-view', { isSaved: issaved, note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount, isUpvoted }) // Specific notes: visiting my notes
                    } else {
                        mynote = 0
                        res.render('note-view/note-view', { isSaved: issaved, note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount, isUpvoted }) // Specific notes: visiting others notes
                    }
                }
            } else {
                mynote = 3 // Non-sessioned users
                let noteInformation = await getNote({noteDocID})
                let [note, owner, feedbacks] = [noteInformation['note'], noteInformation['owner'], noteInformation['feedbacks']]
                res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: owner }) // Specific notes: visiting notes without being logged in
            }
        } catch (error) {
            next(error)
        }
    })

    router.post('/:noteID/postFeedback', async (req, res) => {

        const _commenterStudentID = req.body["commenterStudentID"]
        const _commenterUserName = await Convert.getUserName_studentid(_commenterStudentID)
        const commenterDocID = (await Convert.getDocumentID_studentid(_commenterStudentID)).toString()

        const _noteDocID = req.body["noteDocID"]

        const noteOwnerInfo = await getOwner({noteDocID: _noteDocID}) 
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString()

        
        //NICE-TO-HAVE: see if you can refactor the whole mention->displayname more
        async function replaceFeedbackText(feedbackText: string, removeFirst = false) {
            let mentions = checkMentions(feedbackText)
            let modifiedFeedbackText = ""

            if (removeFirst) {
                let first_mention = mentions[0]
                modifiedFeedbackText = feedbackText.replace(`@${first_mention}`, '').trim()
            } else {
                modifiedFeedbackText = feedbackText
            }

            if (mentions.length !== 0) {
                let users = await Students.find({ username: { $in: mentions } }, { displayname: 1, username: 1 })
                let displaynames = mentions.map(username => {
                    let user = users.find(doc => doc.username === username)
                    return user.displayname
                })
                return replaceMentions(modifiedFeedbackText, displaynames)
            } else {
                return modifiedFeedbackText
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
            let mentions_ = checkMentions(_replyContent)

            let modifiedFeedbackText = _replyContent
            
            let replyData: IReplyDB = {
                noteDocID: _noteDocID,
                commenterDocID: commenterDocID,
                parentFeedbackDocID: req.body["parentFeedbackDocID"],
            } 
            let _reply = await addReply(replyData)
            let parentFeedbackCommenterInfo = _reply["parentFeedbackDocID"]["commenterDocID"]

            
            /*
            * Logic analysis

            When mentions[0] === commenter-username, it means when I will mention my self at first in reply/feedback, the first mention will be removed.
            Cause the first mention will be the user in this case, so it doesn't need to be processed.
            */
            if (_commenterUserName === mentions_[0]) {
                modifiedFeedbackText = await replaceFeedbackText(_replyContent, true)
            } else {
                modifiedFeedbackText = await replaceFeedbackText(_replyContent)
            }

            await replyModel.findByIdAndUpdate(_reply._id, { $set: { feedbackContents: modifiedFeedbackText } })
            let reply = await getReply(_reply._id)

            io.to(replyData.noteDocID).emit('add-reply', reply.toObject())


            /*
            * Logic analysis: reply notification
            
            When commenter-username !== parent-feedback-username, means when the commenter isn't replying his own feedback. mentions[0] === parent-feedback-username
            means the person who is being replied is the one who gave the feedback, shortly the user is repling a feedback, not another reply.
            So, when a user won't give a reply on his own feedback and will give a reply to the parent-feedback, the person who gave the feedback will get a reply-notification. 
            */
            if(_commenterUserName !== parentFeedbackCommenterInfo.username && mentions_[0] === parentFeedbackCommenterInfo.username) {
                await NotificationSender(io, { 
                    noteDocID: _noteDocID, 
                }).sendReplyNotification(reply)
            }


            /*
            * Logic analysis: mention notification
            
            This means, if you are replying someone's feedback, the feedbacker won't get a redundant mention notification, but they will get a reply notification
            */
            let modifiedMentions = mentions_[0] === parentFeedbackCommenterInfo.username ? mentions_.slice(1) : mentions_

            await NotificationSender(io, { 
                noteDocID: _noteDocID, 
                commenterDocID: commenterDocID,
                commenterStudentID: _commenterStudentID
            }).sendMentionNotification(modifiedMentions, reply)
        }
    })

    router.post('/:noteID/vote', async (req, res) => {
        const _noteDocID = req.params.noteID
        const noteOwnerInfo = await getOwner({noteDocID: _noteDocID}) 
        const _ownerStudentID = noteOwnerInfo["ownerDocID"]["studentID"].toString()
        
        const action = req.query["action"]
        const on = req.query["on"]

        let voteType = <"upvote" | "downvote">req.query["type"]
        let noteDocID = req.body["noteDocID"]
        let _voterStudentID = req.body["voterStudentID"]
        let voterStudentDocID = (await Convert.getDocumentID_studentid(_voterStudentID)).toString()

        try {
            if (!on) {
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
                    await deleteVote({ noteDocID, voterStudentDocID })
                    io.emit('decrement-upvote-dashboard', noteDocID)
                    io.to(noteDocID).emit('decrement-upvote')
    
                    res.json({ ok: true })
                }
            } else {
                let feedbackDocID = req.body["feedbackDocID"]                
                if (!action) {
                    await addCommentVote({ voteType, feedbackDocID, noteDocID, voterStudentDocID })
                    res.json({ ok: true })
                } else {
                    await deleteCommentVote({ feedbackDocID, voterStudentDocID })
                    res.json({ ok: true })
                }
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
