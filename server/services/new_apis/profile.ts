import { Router } from "express";
import { Server } from "socket.io";
import { Convert, getProfile, SearchProfile } from "../userService";

const router = Router()

export default function profileApiRouter(io: Server) {
    router.get("/mutual-college", async (req, res) => {
        try {
            let studentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let countDoc = req.query.countdoc ? true : false

            let batch = Number(req.query.batch || "1")
            let count = 15
            let skip = (batch - 1) * count

            let profiles = await SearchProfile.getMutualCollegeStudents(studentDocID, { count: count, skip: skip, countDoc })
            res.json(profiles)
        } catch (error) {
            res.json([])
        }
    })

    router.get("/:username", async (req, res) => {
        try {
            if(req.params.username) {
                let username = req.params.username

                let visiterStudentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
                let profileStudentID = await Convert.getStudentID_username(username)

                let profile = await getProfile(username)
                if (profile.ok) {
                    res.json({ ok: true, profile: {...profile.student, owner: visiterStudentID === profileStudentID } })
                } else {
                    res.json({ ok: false, message: "Sorry, nobody on NoteRoom goes by that name." })
                }
            } else {
                res.json({ ok: false, message: "Page not found!" })
            }
        } catch (error) {
            res.json({ ok: false })
        }
    })

    return router
}
