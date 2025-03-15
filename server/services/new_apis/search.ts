import { Router } from "express";
import { Server } from "socket.io";
import { Convert, SearchProfile } from "../userService";

export const router = Router()
export default function seacrhApiRouter(io: Server) {
    router.get("/", async (req, res) => {
        try {
            if (req.query) {
                const term = <string>req.query.q
                const type = <"profiles" | "posts">req.query.type
                const countDoc = req.query.countdoc ? true : false

                let batch = Number(req.query.batch || "1")
                let maxCount = 20
                let skip = (batch - 1) * maxCount

                if (type === "profiles") {
                    let students = await SearchProfile.getStudent(term, { maxCount: maxCount, skip: skip, countDoc })
                    res.json(students)
                }
            }
        } catch (error) {
            res.json([])
        }
    })

    return router
}
