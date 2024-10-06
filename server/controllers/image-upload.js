const { URL } = require('url')
const fs = require('fs')
const os = require('os')
const path = require('path')
const admin = require('firebase-admin')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const serviceAccount = JSON.parse(process.env.FIREBASE_CLOUD_CRED)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://noteroom-fb1a7.appspot.com"
});

let bucket = admin.storage().bucket()

async function uploadImage(fileObject, fileName) {
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
        metadata: {
            contentType: 'image/png', 
        }
    });

    return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
            console.error('Error uploading file:', err);
            reject(err)
        });
    
        stream.on('finish', async () => {
            await file.makePublic() //! Making the file public for now. Later I will build a automation system to renew private files
            
            let publicUrl = `https://storage.googleapis.com/noteroom-fb1a7.appspot.com/${fileName}`;
            resolve(publicUrl)
        });
    
        stream.end(fileObject.data) // Storing the actual file buffer to the firebase
    })
}

async function downloadImage(publicURLs, destination) {
    let localFilePath = path.join(os.homedir(), 'Downloads/noteroom' , destination)
    let fileDownload = []

    if(!fs.existsSync(localFilePath)) {
        await fs.promises.mkdir(localFilePath, { recursive: true })
        console.log(`Created`)
    }

    for (const url of publicURLs) {
        let filePublicURL = new URL(url)
        let filePath = filePublicURL.pathname.split('/')

        let remotePath = `${filePath[2]}/${filePath[3]}/${filePath[4]}` // studentDocID/NoteID/note-image.png
        let file = bucket.file(remotePath)

        try {
            fileDownload.push(file.download({ destination: path.join(localFilePath, filePath[4]) }))
        } catch (error) {
            console.log(error)
        }
    }

    return new Promise((resolve) => {
        Promise.all(fileDownload).then(() => {
            resolve(true)
        }).catch(error => {
            resolve(false)
        })
    })
}

// bucket.getFiles().then(files => {
//     let files_ = files[0]
//     files_.forEach(file => {
//         file.makePublic()
//     })
// })

module.exports.upload = uploadImage
module.exports.download = downloadImage
