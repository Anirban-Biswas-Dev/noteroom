import { Notifs, feedBackNotifs, mentionNotifs } from "../schemas/notifications.js";
import Students from "../schemas/students.js";

export interface INotification {
    noteDocID: string,
    feedbackDocID: string,
    commenterDocID: string,
    ownerStudentID: string
}

export async function readNoti(notiID: string) {
    await Notifs.updateOne(
        { _id: notiID },
        { $set: { isRead: true } }
    )
}

export async function addFeedbackNoti(notiData: INotification) {
    let feednoti = await feedBackNotifs.create(notiData)
    return feednoti
}

export async function addMentionNoti(notiData: INotification) {
    let mentionoti = await mentionNotifs.create(notiData)
    return mentionoti
}