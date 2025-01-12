import Students from "../schemas/students.js";
import Notes from "../schemas/notes.js";
import { Notifs } from "../schemas/notifications.js";
import {ENotificationType} from "../types/notificationService.type.js";

type rootStudentID = string


export async function getSavedNotes(studentID: rootStudentID) {
    let student = await Students.findOne({ studentID: studentID }, { saved_notes: 1 })
    let saved_notes_ids = student['saved_notes']
    let notes = await Notes.find({ _id: { $in: saved_notes_ids } })
    return notes
}

export async function getNotifications(studentID: rootStudentID) {
    let allNotifications = await Notifs.find().sort({ createdAt: -1 })
    let populatedNotifications = []
    allNotifications.map(doc => {
        if (doc['docType'] === ENotificationType.Feedback) {
            if (doc["ownerStudentID"] == studentID) {
                populatedNotifications.push(doc.populate([
                    { path: 'noteDocID', select: 'title' },
                    { path: 'commenterDocID', select: 'displayname studentID username' }
                ]))
            }
        } else if (doc['docType'] === ENotificationType.Mention) {
            if (doc["mentionedStudentID"] == studentID) {
                populatedNotifications.push(doc.populate([
                    { path: 'noteDocID', select: 'title' },
                    { path: 'commenterDocID', select: 'displayname studentID username' }
                ]))
            }
        } else if (doc['docType'] === ENotificationType.Reply) {
            if (doc["ownerStudentID"] == studentID) {
                populatedNotifications.push(doc.populate([
                    { path: 'noteDocID', select: 'title' },
                    { path: 'commenterDocID', select: 'displayname studentID username' }
                ]))
            }
        } else if (doc['docType'] === ENotificationType.UpVote) {
            if (doc["ownerStudentID"] == studentID) {
                populatedNotifications.push(doc.populate([
                    { path: 'noteDocID', select: 'title upvoteCount' },
                ]))
            }
        } 
        else {
            populatedNotifications.push(doc)
        }
    })

    return Promise.all(populatedNotifications);
}


export async function profileInfo(studentID: rootStudentID) {
    let profile = await Students.findOne({ studentID: studentID })
    return profile
}

export async function unreadNotiCount(studentID: rootStudentID) {
    let u = await Notifs.aggregate([
        { $match: { ownerStudentID: studentID } },
        { $match: { isRead: false } },
        { $count: "unReadCount" }
    ])
    return new Promise(resolve => {
        if (u.length != 0) {
            resolve(u[0]["unReadCount"])
        } else {
            resolve(0)
        }
    })
}