import { Router } from "express";
import { Server } from "socket.io";
import { Convert, SearchProfile } from "../../services/userService";

const router = Router();

export function searchProfileApiRouter(io: Server) {
    router.get('/random', async (req, res, next) => {
        try {
            let count = parseInt(req.query.count as string) || 5
            let students = await SearchProfile.getRandomStudent(count)
            res.json(students)
        } catch (error) {
            res.json([])
        }
    })


    router.get('/mutual-college', async (req, res, next) => {
        try {
            let studentID = req.session["stdid"]
            let studentDocID = (await Convert.getDocumentID_studentid(studentID)).toString()
            let profiles = await SearchProfile.getMutualCollegeStudents(studentDocID)
            res.json(profiles)
        } catch (error) {
            res.json([])
        }
    })


    return router
}
