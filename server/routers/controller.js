async function getSavedNotes(Students, Notes, studentID) {
    let student = await Students.findOne({ studentID: studentID }, { saved_notes: 1 } )
    let saved_notes_ids = student['saved_notes']
    let notes = await Notes.find({ _id: { $in: saved_notes_ids } })
    return notes
}

async function getNotifications(allNotifs, ownerStudentID) {
    let allNotifications = await allNotifs.find().sort({ createdAt: -1 })
    let populatedNotifications = []
    allNotifications.map(doc => {
        if (doc['docType'] === 'feedback') {
            if(doc.ownerStudentID == ownerStudentID) {
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
    switch(type) {
        case 'username':
            root = await Students.findOne({ username: value }, fields)
            break
        case 'studentID':
            root = await Students.findOne({ studentID: value }, fields)
            break
    }
    return root
}

module.exports.getSavedNotes = getSavedNotes
module.exports.getNotifications = getNotifications
module.exports.getRoot = getRoot