import {Router} from 'express'
import {Server} from 'socket.io'
import {getNotifications, getSavedNotes, profileInfo, unreadNotiCount} from '../../helpers/rootInfo.js'
import {getNote, isSaved} from '../../services/noteService.js'
import {Convert} from '../../services/userService.js'
import { isUpVoted } from '../../services/voteService.js';
import { postNoteFeedbackRouter } from './post-feedback.js';
import { voteRouter } from './vote.js';

const router = Router()
function noteViewRouter(io: Server) {
    router.use('/:noteID', postNoteFeedbackRouter(io))
    router.use('/:noteID', voteRouter(io))

    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID
            let mynote: number; //* Varifing if a note is mine or not: corrently using for not allowing users to give feedbacks based on some situations (self-notes and viewing notes without being logged in)

            
            if (req.session["stdid"]) {
                let studentDocID = (await Convert.getDocumentID_studentid(req.session["stdid"])).toString()

                if (noteDocID) {
                    let noteInformation = await getNote({noteDocID, studentDocID})
                    let [note, owner, feedbacks] = [noteInformation['note'], noteInformation['owner'], noteInformation['feedbacks']]

                    //# Root information
                    let root = await profileInfo(req.session["stdid"]) 
                    let savedNotes = await getSavedNotes(req.session["stdid"])
                    let notis = await getNotifications(req.session["stdid"])
                    let unReadCount = await unreadNotiCount(req.session["stdid"])
                    
                    let isUpvoted = await isUpVoted({ noteDocID: noteDocID, voterStudentDocID: studentDocID, voteType: 'upvote' })
                    let issaved = await isSaved({ noteDocID, studentDocID })

                    if (note.ownerDocID == req.cookies['recordID']) {
                        mynote = 1
                        res.render('note-view/note-view', { isSaved: issaved, note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount, isUpvoted }) // Specific notes: visiting my notes
                    } else {
                        mynote = 0
                        res.render('note-view/note-view', { isSaved: issaved, note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis, unReadCount: unReadCount, isUpvoted }) // Specific notes: visiting others notes
                    }
                }
            } else {
                mynote = 3 // Non-sessioned users
                let noteInformation = await getNote({noteDocID})
                let [note, owner, feedbacks] = [noteInformation['note'], noteInformation['owner'], noteInformation['feedbacks']]
                res.render('note-view/note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: owner }) // Specific notes: visiting notes without being logged in
            }
        } catch (error) {
            next(error)
        }
    })

    router.get('/:noteID/shared', async (req, res, next) => {
        let headers = req.headers['user-agent']
        let noteDocID = req.params.noteID
        let note = (await getNote({noteDocID})).note

        if (headers.includes('facebook')) {
            res.render('shared', { note: note, req: req })
        } else {
            res.redirect(`/view/${noteDocID}`)
        }
    })

    return router
}

export default noteViewRouter
