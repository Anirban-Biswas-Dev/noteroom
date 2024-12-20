import { Notifs, feedBackNotifs, mentionNotifs, replyNotifs } from "../schemas/notifications.js";
import { IFeedbackNotificationDB, IMentionNotificationDB, IReplyNotificationDB } from "../types/database.types.js";



export async function readNoti(notiID: string) {
    await Notifs.updateOne({ _id: notiID }, { $set: { isRead: true } })
}

export async function deleteNoti(notiID: string) {
    await Notifs.deleteOne({ _id: notiID })
}

/**
* @description - This is just for note-owner to add notificatios related to notes (**reply** or **feedback**) *commented many times 
*/
export async function addFeedbackNoti(notiData: IFeedbackNotificationDB) {
    let feednoti = await feedBackNotifs.create(notiData)
    return feednoti
}

export async function addMentionNoti(notiData: IMentionNotificationDB) {
    let mentionoti = await mentionNotifs.create(notiData)
    return mentionoti
}

export async function addReplyNoti(replyData: IReplyNotificationDB) {
    let replynoti = await replyNotifs.create(replyData)
    return replynoti
}

// naming: add<notification-type>Noti