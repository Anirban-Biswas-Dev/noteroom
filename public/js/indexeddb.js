const db = new Dexie("Notes")
const dbVersion = 15

db.version(dbVersion).stores({
    savedNotes: "++id,noteID,noteTitle,noteThumbnail,ownerDisplayName,ownerUserName",
    ownedNotes: "++id,noteID,noteTitle,noteThumbnail,ownerDisplayName,ownerUserName",
    notifications: "++id,notiID,content,fromUserSudentDocID,redirectTo,isRead,createdAt,notiType",
    requests: "++id,recID,message,createdAt,senderDisplayName,senderUserName"
})
db.on('versionchange', async (event) => {
    console.log(`Changed the version to ${dbVersion}`)
    try {
        if (event.oldVersion < dbVersion) {
            await db.delete()
            await db.open()
        }
    } catch (error) { 
        console.log(`Error: ${error}`)
    }
})
db.open().then(() => {
    console.log(`indexedDB is initialized`)
}).catch((error) => {
    console.log(`Cannot initialize indexedDB: ${error}`)
})

const manageDb = {
    async add(store, obj) {
        if (store === "savedNotes" || store === "ownedNotes") {
            let existingNote = await db[store].where("noteID").equals(obj._id).first()
            if (!existingNote) {
                await db[store].add({
                    noteID: obj._id,
                    noteTitle: obj.title,
                    noteThumbnail: obj.thumbnail,
                    ownerDisplayName: obj.ownerDocID.displayname,
                    ownerUserName: obj.ownerDocID.username
                })
            }
        } else if (store === "requests") {
            let existingRec = await db[store].where("recID").equals(obj._id).first()
            if (!existingRec) {
                await db[store].add({
                    recID: obj._id,
                    message: obj.message,
                    createdAt: obj.createdAt,
                    senderDisplayName: obj.senderDocID.displayname,
                    senderUserName: obj.senderDocID.username
                })
            }
        } else if (store === "notifications") {
            let existingNoti = await db[store].where("notiID").equals(obj._id).first()
            if (!existingNoti) {
                await db[store].add({
                    notiID: obj._id,
                    content: obj.content,
                    fromUserSudentDocID: obj.fromUserSudentDocID,
                    redirectTo: obj.redirectTo,
                    isRead: obj.isRead,
                    createdAt: obj.createdAt,
                    notiType: obj.notiType
                })
            } else {
                existingNoti = Object.assign(existingNoti, obj)
                await db[store].put(existingNoti)
            }
        }
    },

    async get(store) {
        let allObjects = await db[store].toArray()
        return allObjects
    },

    async delete(store, { idPath, id }) {
        let note = await db[store].where(idPath).equals(id).first()
        await db[store].delete(note.id)
    }
}