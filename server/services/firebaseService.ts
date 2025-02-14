import { join, dirname } from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import firebaseAdmin from 'firebase-admin'; // Default import for firebase-admin
import { IManageUserNote } from '../types/noteService.types.js';
import fs from 'fs';
import path from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

config({ path: join(__dirname, '../.env') });

const serviceAccount = JSON.parse(process.env.FIREBASE_CLOUD_CRED!);

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount), // Correct call to `cert`
    storageBucket: "gs://noteroom-fb1a7.appspot.com"
});

let bucket = firebaseAdmin.storage().bucket();

// async function uploadImage(fileObject: any, fileName: any, options?:any) {
//     if (options && options.replaceWith) {
//         try {
//             const filePath = options.replaceWith.replace('https://storage.googleapis.com/noteroom-fb1a7.appspot.com/', '');
//             await bucket.file(filePath).delete()
//         } catch (error) {}
//     }

//     const file = bucket.file(fileName);
//     const stream = file.createWriteStream({
//         metadata: {
//             contentType: fileObject.mimetype,
//         }
//     });

//     return new Promise((resolve, reject) => {
//         stream.on('error', (err) => {
//             console.error('Error uploading file:', err);
//             reject(err);
//         });

//         stream.on('finish', async () => {
//             await file.makePublic(); //! Making the file public for now.

//             let publicUrl = `https://storage.googleapis.com/noteroom-fb1a7.appspot.com/${fileName}`;
//             resolve(publicUrl);
//         });

//         stream.end(fileObject.buffer || fileObject.data); // Storing the actual file buffer to Firebase
//     });
// }


async function uploadImage(fileObject: any, fileName: string) {
    const uploadDir = path.join(__dirname, 'uploads'); // Base upload directory
    const filePath = path.join(uploadDir, fileName); // Full path with filename
    const fileDirectory = path.dirname(filePath); // Extract directory from path

    if (!fs.existsSync(fileDirectory)) {
        fs.mkdirSync(fileDirectory, { recursive: true }); // Create the missing folders
    }

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, fileObject.data, (err) => {
            if (err) {
                console.error('Error saving file locally:', err);
                return reject(err);
            }

            let fileUrl = `file://${filePath}`; // Local file path
            resolve(fileUrl);
        });
    });
}

async function deleteFolder({ studentDocID, noteDocID }: IManageUserNote, post: boolean = false, studentFolder=false) {
    if (!studentFolder) {
        let noteFolder = post ? `${studentDocID}/quick-posts/${noteDocID}` : `${studentDocID}/${noteDocID}`
        let [files] = await bucket.getFiles({ prefix: noteFolder })
        if (files.length !== 0) {
            await Promise.all(files.map(file => file.delete()))
        }
    } else {
        let [files] = await bucket.getFiles({ prefix: studentDocID })
        if (files.length !== 0) {
            await Promise.all(files.map(file => file.delete()))
        }
    }
}


// bucket.getFiles({ prefix: 'Assets/onboarding/college-logos' }).then(([files]) => {
//     files.map(file => {
//         file.makePublic()    
//     })
// })


export const upload = uploadImage;
export const deleteNoteImages = deleteFolder