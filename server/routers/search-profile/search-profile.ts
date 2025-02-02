import { Router } from 'express'
import { Server } from 'socket.io'
import { getNotifications, profileInfo, unreadNotiCount } from '../../helpers/rootInfo.js'
import { searchProfileApiRouter } from './apis.js'
const router = Router()

function serachProfileRouter(io: Server) {
    router.use('/student', searchProfileApiRouter(io))    
    
    router.get('/', async (req, res, next) => {
        if (req.session["stdid"]) {
            try {
                let root = await profileInfo(req.session["stdid"])
                let notis = await getNotifications(req.session["stdid"])
                let unReadCount = await unreadNotiCount(req.session["stdid"])

                res.render('search-profile', { root: root, notis: notis, unReadCount: unReadCount })
            } catch (error) {
                console.log(error)
                res.json({ students: []})
            }
        } else {
            res.redirect('/login')
        }
    })

    return router
}

export default serachProfileRouter