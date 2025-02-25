import { Router } from "express";
import { changeProfileDetails } from "../userService";
import { Server } from "socket.io";
import { compressImage } from "../../helpers/utils";
import { profileInfo } from "../../helpers/rootInfo";

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

    router.get('/profile', async (req, res) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
            let profile = await profileInfo(studentID)
            res.json({ profile })
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}
