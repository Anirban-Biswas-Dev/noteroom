import { Router } from 'express';
import { Server } from 'socket.io';
import { Convert } from '../../services/userService';
import { getOwner } from '../../services/noteService';
import { checkMentions, replaceMentions } from '../../helpers/utils';
import { IFeedBackDB, IReplyDB } from '../../types/database.types';
import { addFeedback, addReply, getReply } from '../../services/feedbackService';
import { NotificationSender } from '../../services/io/ioNotifcationService';
import { replyModel } from '../../schemas/comments';
import Students from '../../schemas/students';


const router = Router()

export function postNoteFeedbackRouter(io: Server) {
    router.post('/postFeedback', async (req, res) => {

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

    return router
}