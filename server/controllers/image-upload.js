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

module.exports.upload = uploadImage

