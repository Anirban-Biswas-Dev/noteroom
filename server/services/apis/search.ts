import { Router } from "express";
import { Server } from "socket.io";
import Notes from "../../schemas/notes.js";
import Students from "../../schemas/students.js";

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
                let term = req.query.term
                let students = await Students.find(
                    { displayname: { $regex: `^${term}`, $options: 'i' } },
                    { displayname: 1, username: 1, profile_pic: 1, _id: 0 }
                );
        
                res.json(students)
            }
        } catch (error) {
            res.json([])
        }
    })

    return router;
}