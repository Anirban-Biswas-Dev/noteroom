import { join, dirname } from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import firebaseAdmin from 'firebase-admin'; // Default import for firebase-admin

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

export const upload = uploadImage;
