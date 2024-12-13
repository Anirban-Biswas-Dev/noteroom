import { Notifs, feedBackNotifs, mentionNotifs } from "../schemas/notifications.js";

export interface IFeedbackNotificationRecord {
    noteDocID: string,
    feedbackDocID: string,
    commenterDocID: string,
    ownerStudentID: string
}

export async function readNoti(notiID: string) {
    await Notifs.updateOne({ _id: notiID }, { $set: { isRead: true } })
}

export async function deleteNoti(notiID: string) {
    await Notifs.deleteOne({ _id: notiID })
}

export async function addFeedbackNoti(notiData: IFeedbackNotificationRecord) {
    let feednoti = await feedBackNotifs.create(notiData)
    return feednoti
}

export async function addMentionNoti(notiData: IFeedbackNotificationRecord) {
    let mentionoti = await mentionNotifs.create(notiData)
    return mentionoti
}

// naming: add<notification-type>Noti