export const templates = {
    reset_password(globals: any) {
        return `Hi ${globals.displayname}<br>
                We received a request to reset your password for your NoteRoom account. No worries, we've got you covered! <br>
                Click the button below to reset your password: <br>
                👉 <a href='http://noteroom.co/auth/password-reset?token=${globals.reset_token}'>Reset My Password</a> <br><br>


                If you didn't request this, you can safely ignore this email—your password will remain unchanged.<br><br>
                
                For your security, the link will expire in [duration, e.g., 1 hour]. <br><br>

                If you have any questions or need further assistance, feel free to reach out to us at support@noteroom.co. <br><br>

                Best regards, <br>
                The NoteRoom Team
        `
    }
}