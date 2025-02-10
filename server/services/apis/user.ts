import { Router } from "express";
import { changeProfileDetails } from "../userService";
import { Server } from "socket.io";
import { compressImage } from "../../helpers/utils";

const router = Router()

export default function userApiRouter(io: Server) {
    router.post('/profile/change', async (req, res) => {
        try {
            let studentID = req.session["stdid"]
            let fieldName = req.body["fieldName"]
            let newValue = null
            if (req.files) {
                newValue = await compressImage(Object.values(req.files)[0])
            } else {
                newValue = req.body["newValue"]
            }
            
            let result = await changeProfileDetails(studentID, { fieldName, newValue })
            res.json({ ok: result })
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}
