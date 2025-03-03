"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const google_auth_library_1 = require("google-auth-library");
async function verifyToken(client_id, id_token) {
    const client = new google_auth_library_1.OAuth2Client(client_id);
    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: client_id
        });
        return ticket.getPayload();
    }
    catch (error) {
        throw new Error(error);
    }
}
