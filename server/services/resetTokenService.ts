import tokensModel from "../schemas/password_reset_tokens.js";


interface ResetToken {
    email: string,
    reset_token: string
}

export async function addToken({ email, reset_token }: ResetToken) {
    try {
        await tokensModel.create({ email, reset_token })
        return true
    } catch (error) {
        return false
    }
}

export async function getToken(reset_token: string) {
    try {
        let token_document = await tokensModel.findOne({ reset_token: reset_token }, { email: 1, reset_token: 1 })
        return token_document.toObject()
    } catch (error) {
        return false
    }
}

export async function deleteToken(reset_token: string) {
    try {
        await tokensModel.deleteOne({ reset_token: reset_token })
        return true
    } catch (error) {
        return false
    }
}
