import { InteractionNotifs, Notifs } from "../schemas/notifications.js";

export async function readNoti(notiID: string) {
    await Notifs.updateOne({ _id: notiID }, { $set: { isRead: true } })
}

export async function deleteNoti(notiID: string) {
    await Notifs.deleteOne({ _id: notiID })
}

export async function deleteAllNoti(ownerStudentID: string) {
    try {
        let result = await Notifs.deleteMany({ ownerStudentID: ownerStudentID })
        return result.deletedCount !== 0
    } catch (error) {
        return false
    }
}

export async function addNoti(notiData: any) {
    let data = await Notifs.create(notiData)
    return data
}

export async function addInteractionNoti(notiData: any) {
    let data = await InteractionNotifs.create(notiData)
    return data.populate('fromUserSudentDocID', 'displayname username profile_pic')
}

// naming: add<notification-type>Noti