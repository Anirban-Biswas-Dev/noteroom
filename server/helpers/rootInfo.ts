import Students from "../schemas/students.js";
import Notes from "../schemas/notes.js";
import { Notifs } from "../schemas/notifications.js";
import {ENotificationType} from "../types/notificationService.type.js";

type rootStudentID = string

//* This is for side-panel data collection


export async function getSavedNotes(studentID: rootStudentID) {
    let student = await Students.findOne({ studentID: studentID }, { saved_notes: 1 })
    let saved_notes_ids = student['saved_notes']
    let notes = await Notes.find({ _id: { $in: saved_notes_ids } })
    return notes
}

export async function getNotifications(studentID: rootStudentID) {
    let allNotifications = await Notifs.find({ ownerStudentID: studentID })
    let populatedNotifications = []

    await Promise.all(
        allNotifications.map(async (notification) => {
            if (notification["docType"] === 'interaction') {
                let populatedNotification = await notification.populate('fromUserSudentDocID', 'displayname username profile_pic')
                populatedNotifications.push(populatedNotification)
            } else {
                populatedNotifications.push(notification)
            }
        })
    )
    return populatedNotifications
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