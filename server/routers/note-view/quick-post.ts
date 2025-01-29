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

const router = Router()

export function quickPostRouter(io: Server) {
    router.get('/:postID', async (req, res) => {
        let ownerDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()
        let postID = req.params.postID
        let postData = await getNote({ noteDocID: postID, studentDocID: ownerDocID })
        let [post, owner] = [postData["note"], postData["owner"]]

        // res.render('note-view', { postType: 'quick-post' })
    })

    router.post('/', async (req, res) => {
        let notificationTitle = req.body["text"] ? `${(<string>req.body["text"]).slice(0, 20)}...` : 'Quick Post upload failure'
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

            finalPost = await addQuickPost(postData)
            postID = finalPost["_id"].toString()
    
            if (req.files) {
                let fileObject = <fileUpload.UploadedFile>Object.values(req.files)[0]
                let compressedImage = await compressImage(fileObject)
                let publicUrl = (await upload(compressedImage, `${ownerDocID}/quick-posts/${finalPost._id.toString()}/${fileObject.name}`)).toString()
                file.push(publicUrl)
    
                await notesModel.updateOne({ _id: finalPost._id }, { $set: { content: file, completed: true } })
            }

            await notesModel.updateOne({ _id: finalPost._id }, { $set: { completed: true } })

            await NotificationSender(io, {
                ownerStudentID: req.session["stdid"],
                redirectTo: `/view/quick-post/${postID}`
            }).sendNotification({
                content: "Your quick-post uploaded successfully!",
                title: notificationTitle,
                event: 'notification-note-upload-success'
            })
            

        } catch (error) {
            await deleteNote({ noteDocID: postID, studentDocID: ownerDocID }, true)
            await NotificationSender(io, {
                ownerStudentID: req.session["stdid"],
            }).sendNotification({
                content: "Your quick-post couldn't be uploaded!",
                title: notificationTitle,
                event: 'notification-note-upload-failure'
            })
        }
    })

    return router
}