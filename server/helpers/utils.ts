import fileUpload from "express-fileupload"
import slugify from "slugify"
import sharp from "sharp"
import { v4 as uuidv4 } from "uuid"
import crypto from 'crypto'
import { createLogger, format, transports } from "winston"


export function getHash(input: string, salt = `${Math.random()}`) {
    const hash = crypto.createHash('sha256');
    hash.update(input + salt);
    return hash.digest('hex');
}

export function checkMentions(feedbackText: string) {
    let mentions = /@[a-z0-9-]+-[a-z0-9]{8}/g
    let answers = feedbackText.match(mentions)
    if (answers) {
        let mentionedUsers = answers.map(m => m.replace('@', ''))
        return mentionedUsers
    } else {
        return []
    }
}

export function replaceMentions(feedbackText: string, displaynames: string[]) {
    let mentions = checkMentions(feedbackText).map(username => `@${username}`)
    let i = 0
    mentions.map(mention => {
        feedbackText = feedbackText.replace(mention, `
            <a href="/user/${mention.replace(`@`, ``)}" class="thread-mentioned-user">
                @${displaynames[i]}
            </a>`)
        i += 1
    })
    return feedbackText
}

export function generateRandomUsername(displayname: string) {
    let sluggfied = slugify(displayname, {
        lower: true,
        strict: true
    })
    let uuid = uuidv4()
    let suffix = uuid.split("-")[0]
    let username = `${sluggfied}-${suffix}`

    return {
        userID: uuid,
        username: username
    }
}


export async function compressImage(fileObject: any) {
    let imageBuffer = fileObject.data
    let imageType: "jpeg" | "png" = fileObject.mimetype === "image/jpeg" ? "jpeg" : "png"
    let compressedBuffer = await sharp(imageBuffer)
        [imageType](
            imageType === "png" 
            ? { quality: 70, compressionLevel: 9, adaptiveFiltering: true } 
            : { quality: 70, progressive: true }
        ).toBuffer()
    let compressFileObject = Object.assign(fileObject, { buffer: compressedBuffer, size: compressedBuffer.length })
    return compressFileObject
}

export function setSession({ recordID, studentID, username }, req: any, res: any) {
    req["session"]["stdid"] = studentID // setting the session with the student ID
    res["cookie"]('recordID', recordID, {
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    }) // setting a cookie with a value of the document ID of the user
    res["cookie"]('studentID', studentID, {
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    }),
    res["cookie"]('username', username, {
        secure: false,
        maxAge: 1000 * 60 * 60 * 720
    })
}


const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
          return `${(new Date(String(timestamp))).toString()} [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        new transports.File({ filename: 'noteroom_logs.log', level: 'error' }),
        new transports.Console(),
    ],
});
export async function log(level: string, message: string) {
    logger.log(level, message)
}