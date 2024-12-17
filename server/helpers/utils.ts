import slug from "slug"
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