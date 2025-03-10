import {Router} from 'express'
import {Server} from 'socket.io'
import {getNotifications, getSavedNotes, profileInfo, unreadNotiCount} from '../../helpers/rootInfo.js'
import {getNote, getNoteForShare} from '../../services/noteService.js'
import {Convert} from '../../services/userService.js'
import { postNoteFeedbackRouter } from './post-feedback.js';
import { voteRouter } from './vote.js';
import apisRouter from './apis.js'
import { quickPostRouter } from './quick-post.js'

const router = Router()
function noteViewRouter(io: Server) {
    router.use('/quick-post', quickPostRouter(io))
    router.use('/:noteID', postNoteFeedbackRouter(io))
    router.use('/:noteID', voteRouter(io))
    router.use('/:noteID', apisRouter(io))

    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID

            if (req.session["stdid"]) {
                let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()

                if (noteDocID) {
                    let noteInformation = await getNote({noteDocID, studentDocID})
                    if (noteInformation["error"]  || noteInformation["note"]["postType"] === 'quick-post') {
                        next(new Error('Post not found!'))
                    } else {
                        let [note, owner] = [noteInformation['note'], noteInformation['owner']]
    
                        let root = await profileInfo(req.session["stdid"]) 
                        let savedNotes = await getSavedNotes(req.session["stdid"])
                        let notis = await getNotifications(req.session["stdid"])
                        let unReadCount = await unreadNotiCount(req.session["stdid"])
                        
                        res.render('note-view/note-view', { postType: 'note', note: note, owner: owner, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount }) // Specific notes: visiting my notes
                    }
                }
            } else {
                res.redirect('/login')
            }
        } catch (error) {
            next(error)
        }
    })

    router.get('/:noteID/shared', async (req, res, next) => {
        let headers = req.headers['user-agent']
        let noteDocID = req.params.noteID

        if (!headers.includes('facebook')) {
            res.redirect(`/view/${noteDocID}`)
        } else {
            let note = await getNoteForShare({ noteDocID })
            res.render('shared', { note: note, req: req })
        }

    })

    return router
}

export default noteViewRouter
