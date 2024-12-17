import { Router } from 'express'
import { SearchProfile } from '../services/userService.js'
import { Server } from 'socket.io'
import { getNotifications, getSavedNotes, profileInfo, unreadNotiCount } from '../helpers/rootInfo.js'
const router = Router()

function serachProfileRouter(io: Server) {
    router.get('/', async (req, res, next) => {
        if (req.session["stdid"]) {
            try {
                let searchTerm = req.query.q?.toString()
                if (searchTerm) {
                    let students = await SearchProfile.getStudent(searchTerm)
                    res.json({ students })
                } else {
                    let students = await SearchProfile.getRandomStudent(3)

                    //=> Root information
                    let root = await profileInfo(req.session["stdid"])
                    let savedNotes = await getSavedNotes(req.session["stdid"])
                    let notis = await getNotifications(req.session["stdid"])
                    let unReadCount = await unreadNotiCount(req.session["stdid"])

                    res.render('search-profile', { students: students, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount })
                }
            } catch (error) {
                console.log(error)
                next(error)
            }
        } else {
            res.redirect('/login')
        }
    })

    return router
}

export default serachProfileRouter