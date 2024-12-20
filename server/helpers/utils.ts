import fileUpload from "express-fileupload"
import slug from "slug"
import sharp from "sharp"
import { v4 as uuidv4 } from "uuid"

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

export function generateRandomUsername(displayname: string) {
    let sluggfied = slug(displayname)
    let uuid = uuidv4()
    let suffix = uuid.split("-")[0]
    let username = `${sluggfied}-${suffix}`

    return {
        userID: uuid,
        username: username
    }
}


export async function compressImage(fileObject: fileUpload.UploadedFile) {
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
