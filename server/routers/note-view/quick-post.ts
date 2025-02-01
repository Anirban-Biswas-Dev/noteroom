import { Router } from "express";
import { Server } from "socket.io";
import { Convert } from "../../services/userService";
import { addQuickPost, deleteNote, getNote } from "../../services/noteService";
import { IQuickPostDB } from "../../types/database.types";
import fileUpload from "express-fileupload";
import { compressImage } from "../../helpers/utils";
import { upload } from "../../services/firebaseService";
import notesModel from "../../schemas/notes";
import { userSocketMap } from "../../server";
import { NotificationSender } from "../../services/io/ioNotifcationService";
import { profileInfo, getSavedNotes, getNotifications, unreadNotiCount } from "../../helpers/rootInfo";

const router = Router()

export function quickPostRouter(io: Server) {
    router.get('/:postID', async (req, res, next) => {
        try {
            let postID = req.params.postID
            let ownerDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
            let postData = await getNote({ noteDocID: postID, studentDocID: ownerDocID })

            if (postData["error"] || postData["note"]["postType"] === 'note') {
                next(new Error('Post not found!'))
            } else {
                let [post, owner] = [postData["note"], postData["owner"]]
    
                let root = await profileInfo(req.session["stdid"]) 
                let savedNotes = await getSavedNotes(req.session["stdid"])
                let notis = await getNotifications(req.session["stdid"])
                let unReadCount = await unreadNotiCount(req.session["stdid"])
            
                res.render('note-view/note-view', { postType: 'quick-post', note: post, owner: owner, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount })
            }
        } catch (error) {
            next(error)
        }
    })

    router.post('/', async (req, res) => {
        let notificationTitle = req.body["text"] ? `${(<string>req.body["text"]).slice(0, 20)}...` : 'Untitled Post'
        "Untitled Post"
        let ownerDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
        let postID: string;
        
        try {
            let postText = req.body["text"]
            let file = []; 
            
            let finalPost: any;
            
            let postData: IQuickPostDB = {
                ownerDocID: ownerDocID,
                description: postText,
                content: file,
                postType: 'quick-post'
            }
            res.json({ ok: true })

            let contentCount: number = 0
            let content = null

            finalPost = await addQuickPost(postData)
            postID = finalPost["_id"].toString()
    
            if (req.files) {
                let fileObject = <fileUpload.UploadedFile>Object.values(req.files)[0]
                let compressedImage = await compressImage(fileObject)
                let publicUrl = (await upload(compressedImage, `${ownerDocID}/quick-posts/${finalPost._id.toString()}/${fileObject.name}`)).toString()
                file.push(publicUrl)
                contentCount = 1
                content = publicUrl
    
                await notesModel.updateOne({ _id: finalPost._id }, { $set: { content: file, completed: true } })
            }

            await notesModel.updateOne({ _id: finalPost._id }, { $set: { completed: true } })

            await NotificationSender(io, {
                ownerStudentID: req.session["stdid"],
                redirectTo: `/view/quick-post/${postID}`
            }).sendNotification({
                content: `Your quick-post '${notificationTitle}' uploaded successfully!`,
                event: 'notification-note-upload-success'
            })

            let owner = await profileInfo(req.session["stdid"]) //* Getting the user information, basically the owner of the note
            io.emit('note-upload', { //* Handler 1: Dashboard; for adding the note at feed via websockets
                noteID /* Document ID of the note */: postID,
                noteTitle /* Title of the note */: null,
                description: postData.description,
                createdAt: finalPost.createdAt,

                content1: content,
                content2: null,
                contentCount /* The first image of the notes content as a thumbnail */: contentCount,
                
                ownerID /* Student ID of the owner of the note */: owner.studentID,
                profile_pic /* Profile pic path of the owner of the note */: owner.profile_pic,
                ownerDisplayName /* Displayname of the owener of the note*/: owner.displayname,
                ownerUserName /* Username of the owner of the note */: owner.username,

                isSaved: false,
                isUpvoted: false,
                feedbackCount: 0, 
                upvoteCount: 0,

                quickPost: true
            })
            

        } catch (error) {
            await deleteNote({ noteDocID: postID, studentDocID: ownerDocID }, true)
            await NotificationSender(io, {
                ownerStudentID: req.session["stdid"],
            }).sendNotification({
                content: `Your quick-post '${notificationTitle}' couldn't be uploaded!`,
                event: 'notification-note-upload-failure'
            })
        }
    })

    return router
}