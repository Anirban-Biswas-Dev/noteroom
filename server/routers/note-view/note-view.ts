import {Router} from 'express'
import {Server} from 'socket.io'
import {getNotifications, getSavedNotes, profileInfo, unreadNotiCount} from '../../helpers/rootInfo.js'
import {getNote, getNoteForShare} from '../../services/noteService.js'
import {Convert} from '../../services/userService.js'
import { postNoteFeedbackRouter } from './post-feedback.js';
import { voteRouter } from './vote.js';
import { INoteDetails } from '../../types/noteService.types.js'
import apisRouter from './apis.js'

//TODO: fetch the comments dynamically
const router = Router()
function noteViewRouter(io: Server) {
    router.use('/:noteID', postNoteFeedbackRouter(io))
    router.use('/:noteID', voteRouter(io))
    router.use('/:noteID', apisRouter(io))

    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID
            let mynote: number; //* Varifing if a note is mine or not: corrently using for not allowing users to give feedbacks based on some situations (self-notes and viewing notes without being logged in)

            
            if (req.session["stdid"]) {
                let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()

                if (noteDocID) {
                    let noteInformation = await getNote({noteDocID, studentDocID})
                    let [note, owner] = [noteInformation['note'], noteInformation['owner']]

                    //# Root information
                    let root = await profileInfo(req.session["stdid"]) 
                    let savedNotes = await getSavedNotes(req.session["stdid"])
                    let notis = await getNotifications(req.session["stdid"])
                    let unReadCount = await unreadNotiCount(req.session["stdid"])
                    
                    
                    if (note.ownerDocID == req.cookies['recordID']) {
                        mynote = 1
                        res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount }) // Specific notes: visiting my notes
                    } else {
                        mynote = 0
                        res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount }) // Specific notes: visiting others notes
                    }
                }
            } else {
                mynote = 3 // Non-sessioned users
                let noteInformation = await getNote({noteDocID})
                let [note, owner] = [noteInformation['note'], noteInformation['owner']]
                res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, root: owner }) // Specific notes: visiting notes without being logged in
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
