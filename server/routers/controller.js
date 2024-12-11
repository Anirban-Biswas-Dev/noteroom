async function getSavedNotes(Students, Notes, studentID) {
    let student = await Students.findOne({ studentID: studentID }, { saved_notes: 1 })
    let saved_notes_ids = student['saved_notes']
    let notes = await Notes.find({ _id: { $in: saved_notes_ids } })
    return notes
}

async function getNotifications(allNotifs, ownerStudentID) {
    let allNotifications = await allNotifs.find().sort({ createdAt: -1 })
    let populatedNotifications = []
    allNotifications.map(doc => {
        if (doc['docType'] === 'feedback' || doc['docType'] === 'mention') {
            if (doc.ownerStudentID == ownerStudentID) {
                populatedNotifications.push(doc.populate([
                    { path: 'noteDocID', select: 'title' },
                    { path: 'commenterDocID', select: 'displayname studentID username' }
                ]))
            }
        } else {
            populatedNotifications.push(doc)
        }
    })

    let data = await Promise.all(populatedNotifications)
    return data
}

async function getRoot(Students, value, type, fields) {
    let root;
    switch (type) {
        case 'username':
            root = await Students.findOne({ username: value }, fields)
            break
        case 'studentID':
            root = await Students.findOne({ studentID: value }, fields)
            break
    }
    return root
}

async function unreadNotiCount(allNotifs, ownerStudentID) {
    let u = await allNotifs.aggregate([
        { $match: { ownerStudentID: ownerStudentID } },
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

const _getSavedNotes = getSavedNotes
export { _getSavedNotes as getSavedNotes }
const _getNotifications = getNotifications
export { _getNotifications as getNotifications }
const _getRoot = getRoot
export { _getRoot as getRoot }
const _unreadNotiCount = unreadNotiCount
export { _unreadNotiCount as unreadNotiCount }