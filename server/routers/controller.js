async function getSavedNotes(Students, Notes, studentID) {
    let student = await Students.findOne({ studentID: studentID }, { saved_notes: 1 } )
    let saved_notes_ids = student['saved_notes']
    let notes = await Notes.find({ _id: { $in: saved_notes_ids } })
    return notes
}

async function getNotifications(allNotifs, ownerUsername) {
    let allNotifications = await allNotifs.find()
    let populatedNotifications = []
    allNotifications.map(doc => {
        if (doc['docType'] === 'feedback') {
            if(doc.ownerUsername == ownerUsername) {
                populatedNotifications.push(doc.populate([
                    { path: 'noteDocID', select: 'title' },
                    { path: 'commenterDocID', select: 'displayname studentID' }
                ]))
            }
        } else {
            populatedNotifications.push(doc)
        }
    })

    let data = await Promise.all(populatedNotifications)
    return data
}

async function getRoot(username, Students) {
    let root = await Students.findOne({ username: username })
    return root
}

module.exports.getSavedNotes = getSavedNotes
module.exports.getNotifications = getNotifications