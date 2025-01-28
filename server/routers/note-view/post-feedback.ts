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
        async function replaceFeedbackText(feedbackText: string) {
            let mentions = checkMentions(feedbackText)

            if (mentions.length !== 0) {
                let users = await Students.find({ username: { $in: mentions } }, { displayname: 1, username: 1 })
                let displaynames = mentions.map(username => {
                    let user = users.find(doc => doc.username === username)
                    return user.displayname
                })
                return replaceMentions(feedbackText, displaynames)
            } else {
                return feedbackText
            }
        }

        
        if(!req.body["reply"]) {
            try {
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
                        redirectTo: `/view/${_noteDocID}#${feedback["_id"].toString()}`
                    }).sendNotification({
                        title: feedback['noteDocID']['title'],
                        content: `${feedback['commenterDocID']['displayname']} left a comment!`,
                        event: 'notification-feedback'
                    })
                }
        
                // let mentions = checkMentions(_feedbackContents)
                // await NotificationSender(io, { 
                //     noteDocID: _noteDocID, 
                //     commenterDocID: commenterDocID,
                //     commenterStudentID: _commenterStudentID,
                // }).sendMentionNotification(mentions, feedback)
    
                res.json({ sent: true })
            } catch (error) {
                res.json({ sent: false })
            }
            
        } else {
            try {
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
    
                
                modifiedFeedbackText = await replaceFeedbackText(_replyContent)
    
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
                        ownerStudentID: parentFeedbackCommenterInfo["studentID"],
                        redirectTo: `/view/${_noteDocID}#${reply["_id"].toString()}`
                    }).sendNotification({
                        title: reply['noteDocID']['title'],
                        content: `${reply['commenterDocID']['displayname']} gave reply!`,
                        event: 'notification-reply'
                    })
                }
    
    
                /*
                * Logic analysis: mention notification
                
                This means, if you are replying someone's feedback, the feedbacker won't get a redundant mention notification, but they will get a reply notification
                */
                let modifiedMentions = mentions_[0] === parentFeedbackCommenterInfo.username ? mentions_.slice(1) : mentions_
    
                // await NotificationSender(io, { 
                //     noteDocID: _noteDocID, 
                //     commenterDocID: commenterDocID,
                //     commenterStudentID: _commenterStudentID
                // }).sendMentionNotification(modifiedMentions, reply)
    
                res.json({ sent: true })
            } catch (error) {
                res.json({ sent: false })
            }
        }
    })

    return router
}