import nodemailer from 'nodemailer'
import { config } from 'dotenv';
import { dirname, join } from 'path/posix';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env') });

const appPassword = process.env.NOTEROOM_TEAM_APP_PASSWORD
export default function sendMail(to: string, { subject, message }): boolean {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, 
        auth: {
            user: 'noteroom.team@gmail.com',
            pass: appPassword,
        }
    });
      
    const mailOptions = {
        to: to,
        subject: subject,
        html: message
    };
    
    let retured: boolean = true;
    transporter.sendMail(mailOptions, function (error: any, info: { response: any; }) {
        if (error) {
            retured = false
        } else {
            retured = true
        }
    });

    return retured
}
