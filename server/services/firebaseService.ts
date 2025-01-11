import { join, dirname } from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import firebaseAdmin from 'firebase-admin'; // Default import for firebase-admin
import { IManageUserNote } from '../types/noteService.types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') });

const serviceAccount = JSON.parse(process.env.FIREBASE_CLOUD_CRED!);

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount), // Correct call to `cert`
    storageBucket: "gs://noteroom-fb1a7.appspot.com"
});

let bucket = firebaseAdmin.storage().bucket();

async function uploadImage(fileObject: any, fileName: any) {
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
        metadata: {
            contentType: fileObject.mimetype,
        }
    });

    return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
            console.error('Error uploading file:', err);
            reject(err);
        });

        stream.on('finish', async () => {
            await file.makePublic(); //! Making the file public for now.

            let publicUrl = `https://storage.googleapis.com/noteroom-fb1a7.appspot.com/${fileName}`;
            resolve(publicUrl);
        });

        stream.end(fileObject.buffer || fileObject.data); // Storing the actual file buffer to Firebase
    });
}

async function deleteNoteFolder({ studentDocID, noteDocID }: IManageUserNote) {
    let noteFolder = `${studentDocID}/${noteDocID}`
    let [files] = await bucket.getFiles({ prefix: noteFolder })
    if (files.length !== 0) {
        await Promise.all(files.map(file => file.delete()))
    }
}


export const upload = uploadImage;
export const deleteNoteImages = deleteNoteFolder