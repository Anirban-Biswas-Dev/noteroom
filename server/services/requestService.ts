import Requests from "../schemas/requests"

export async function addRequest(requestData: any) {
    let recData = await Requests.create(requestData)
    return recData.populate([
        { path: 'senderDocID', select: 'studentID username displayname profile_pic' },
        { path: 'receiverDocID', select: 'studentID username displayname profile_pic' }
    ]) 
}

export async function getRequests(ownerDocID: string) {
    try {
        let requests = await Requests.find({ receiverDocID: ownerDocID })
        let extendedRecData = await Promise.all(requests.map(async recData => {
            return recData.populate([
                { path: 'senderDocID', select: 'studentID username displayname profile_pic' },
                { path: 'receiverDocID', select: 'studentID username displayname profile_pic' }
            ]) 
        }))
        return { ok: true, requests: extendedRecData }
    } catch (error) {
        return { ok: false }
    }
}

export async function deleteRequest(reqID: string) {
    let deleteResult = await Requests.deleteOne({ _id: reqID })
    return deleteResult.deletedCount !== 0
}
