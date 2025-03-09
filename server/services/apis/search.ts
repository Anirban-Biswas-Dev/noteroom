import { Router } from "express";
import { Server } from "socket.io";
import Notes from "../../schemas/notes.js";
import { SearchProfile } from "../userService.js";

const router = Router()

export default function searchRouter(io: Server) {
    router.get('/note', async (req, res, next) => {
        try {
            let searchTerm = req.query.q as string
            const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
            let notes = await Notes.find({ title: { $regex: regex }, type_: { $ne: "private" } }, { title: 1 })
            res.json(notes)
        } catch (error) {
            res.json([])
        }
    })

    router.get('/user', async (req, res, next) => {
        try {
            if (req.query) {
                let term = <string>req.query.term

                if (req.query.batch) {
                    let batch = Number(req.query.batch || "1")
                    let maxCount = 20
                    let skip = (batch - 1) * maxCount
                    let countDoc = req.query.countdoc ? true : false
                    let students = await SearchProfile.getStudent(term, { maxCount: maxCount, skip: skip, countDoc })
                    res.json(students)
                } else {
                    let students = await SearchProfile.getStudent(term)
                    res.json(students)
                }
            }
        } catch (error) {
            res.json([])
        }
    })

    return router;
}