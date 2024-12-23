import { OAuth2Client } from "google-auth-library"

export async function verifyToken(client_id: string, id_token: string) {
    const client = new OAuth2Client(client_id)
    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: client_id
        })
        return ticket.getPayload()
    } catch (error) {
        throw new Error(error)
    }
}
