import { join } from 'path';
import { config } from 'dotenv';
import firebaseAdmin from 'firebase-admin'; // Default import for firebase-admin
import { IManageUserNote } from '../types/noteService.types.js';
import { log } from '../helpers/utils.js';

config({ path: join(__dirname, '../.env') });

const serviceAccount = JSON.parse(process.env.FIREBASE_CLOUD_CRED!);
const bucketName = process.env.NOTEROOM_PRODUCTION_FIREBASE_BUCKET
// const bucketName = process.env.NOTEROOM_DEVELOPMENT_FIREBASE_BUCKET

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount), // Correct call to `cert`
    storageBucket: `gs://${bucketName}`
});

let bucket = firebaseAdmin.storage().bucket();

async function uploadImage(fileObject: any, fileName: any, options?:any) {
    try {
        if (options && options.replaceWith) {
            const filePath = options.replaceWith.replace(`https://storage.googleapis.com/${bucketName}/`, '');
            await bucket.file(filePath).delete()
        }
        const file = bucket.file(fileName);
        await file.save(fileObject.buffer || fileObject.data, {
            metadata: { contentType: fileObject.mimetype }
        })
    
        await file.makePublic(); //! Making the file public for now.

        let publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        log('info', `On uploadImage fileName=${fileName || "--filename--"}: Picture is uploaded successfully.`)

        return publicUrl
    } catch (error) {
        log('error', `On uploadImage fileName=${fileName || "--filename--"}: Picture upload failure. Sending null: ${error.message}`)
        return null
    }    
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