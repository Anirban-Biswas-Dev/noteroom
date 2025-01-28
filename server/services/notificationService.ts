import { IGeneralNotificationDB, INoteUploadConfirmationNotificationDB } from './../types/database.types';
import { Notifs, commentVotesNotifs, feedBackNotifs, generalNotifs, mentionNotifs, ntUploadConfirm, replyNotifs, votesNotifs } from "../schemas/notifications.js";
import { IFeedbackNotificationDB, IMentionNotificationDB, IReplyNotificationDB, IUpVoteNotificationDB } from "../types/database.types.js";



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

export async function addVoteNoti(voteData: IUpVoteNotificationDB, isCommentVote = false) {
    if (!isCommentVote) {
        let votenoti = await votesNotifs.create(voteData)
        return votenoti
    } else {
        let votenoti = await commentVotesNotifs.create(voteData)
        return votenoti
    }
}

export async function addNoteUploadConfirmationNoti(notiData: INoteUploadConfirmationNotificationDB) {
    let data = await ntUploadConfirm.create(notiData)
    return data
}

export async function addGeneralNoti(notiData: IGeneralNotificationDB) {
    let data = await generalNotifs.create(notiData)
    return data
}

// naming: add<notification-type>Noti