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

        async function sendMentionNotification(baseDocument: any, mentions: string[], commenterDocID: string) {
            let mentionedStudentIDs = (await Students.find({ username: { $in: mentions } }, { studentID: 1 })).map(data => data.studentID)

            mentionedStudentIDs.forEach(async ownerStudentID => {
                if (ownerStudentID === _commenterStudentID) return

                let postTitle = (baseDocument["noteDocID"]["title"]?.slice(0, 20)  || baseDocument["noteDocID"]["description"].slice(0, 20)) + '...'
                let isQuickPost = baseDocument["noteDocID"]["postType"] === 'quick-post'

                await NotificationSender(io, {
                    ownerStudentID: ownerStudentID,
                    redirectTo: isQuickPost ? `/view/quick-post/${_noteDocID}` : `/view/${_noteDocID}`
                }).sendNotification({
                    content: `mentioned you in a comment on "${postTitle}". Join the conversation!`,
                    event: 'notification-mention'
                }, commenterDocID)
            })
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
                io.to(feedbackData.noteDocID).emit('add-feedback', feedback.feedback.toObject())
                
                if (_ownerStudentID !== _commenterStudentID) {
                    let postTitle = (feedback['noteDocID']['title']?.slice(0, 20) || feedback['noteDocID']['description']?.slice(0, 20)) + '...'
                    let isQuickPost = feedback['noteDocID']['postType'] === 'quick-post'

                    await NotificationSender(io, {
                        ownerStudentID: _ownerStudentID,
                        redirectTo: (isQuickPost ? `/view/quick-post/${_noteDocID}` : `/view/${_noteDocID}`) + `#${feedback["_id"].toString()}`
                    }).sendNotification({
                        content: `left a comment on "${postTitle}". Check it out!`,
                        event: 'notification-feedback',
                    }, commenterDocID)
                }
        
                let mentions = checkMentions(_feedbackContents)
                await sendMentionNotification(feedback, mentions, commenterDocID)
    
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
                let {reply: _reply} = await addReply(replyData)
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
                    let postTitle = (reply['noteDocID']['title']?.slice(0, 20) || reply['noteDocID']['description']?.slice(0, 20)) + '...'
                    let isQuickPost = reply['noteDocID']['postType'] === 'quick-post'

                    await NotificationSender(io, {
                        ownerStudentID: parentFeedbackCommenterInfo["studentID"],
                        redirectTo: (isQuickPost ? `/view/quick-post/${_noteDocID}` : `/view/${_noteDocID}` + `#${reply["_id"].toString()}`)
                    }).sendNotification({
                        content: `replied to your comment on "${postTitle}". See their response!`,
                        event: 'notification-reply'
                    }, commenterDocID)
                }
    
    
                /*
                * Logic analysis: mention notification
                
                This means, if you are replying someone's feedback, the feedbacker won't get a redundant mention notification, but they will get a reply notification
                */
                let modifiedMentions = mentions_[0] === parentFeedbackCommenterInfo.username ? mentions_.slice(1) : mentions_
                await sendMentionNotification(reply, modifiedMentions, commenterDocID)

                res.json({ sent: true })
            } catch (error) {
                res.json({ sent: false })
            }
        }
    })


    return router
}