import { Router } from 'express'
import { Convert, getProfile } from '../services/userService.js'
import { getNotifications, getSavedNotes, unreadNotiCount } from '../helpers/rootInfo.js'
import { Server } from 'socket.io'
import { log } from '../helpers/utils.js'

const router = Router()

function userRouter(io: Server) {
    router.get('/:username?', async (req, res, next) => {
        try {
            if(req.params.username) {
                let username = req.params.username

                let visiterStudentID = req.session["stdid"] || "9181e241-575c-4ef3-9d3c-2150eac4566d"
                let profileStudentID = await Convert.getStudentID_username(username)

                let profile = await getProfile(username)
                if (profile.ok) {
                    res.json({ ok: true, profile: {...profile.student, owner: visiterStudentID === profileStudentID } })
                } else {
                    //TODO: manage unknown user profile
                    res.json({ ok: false, message: "Sorry, nobody on NoteRoom goes by that name." })
                }
            } else {
                //TODO: 404 page not found general page creation
                res.json({ ok: false, message: "Page not found!" })
            }
        } catch (error) {
            console.log(error)
        }
    })

    return router
}

export default userRouter
