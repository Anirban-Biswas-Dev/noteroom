const express = require('express')
const router = express.Router()
const Notes = require('../schemas/notes')
const Students = require('../schemas/students')

function noteViewRouter(io) {
    async function get_note(noteID) {
        // If the noteid is given in the url, the specific note will be shown. Otherwise all the notes will be shown (note repo)
        if(noteID) {
            let note = await Notes.findById(noteID, { title: 1, subject: 1, description: 1, ownerid: 1 , content: 1 } )
            let owner = await Students.findById(note.ownerid, { displayname: 1, studentid: 1 })
            return { note: note, owner: owner }
        } else {
            let notes = await Notes.find({}, { title: 1, subject: 1, description: 1 })
            return notes
        }
    }
    
    router.get('/:noteID?', (req, res, next) => {
        if(req.session.stdid) {
            let noteID = req.params.noteID
            let mynote = true //! Varivication for identifing owner's notes and other's notes. Maybe be removed soon
            if(noteID) {
                get_note(noteID).then(information => {
                    let note = information['note']
                    let owner = information['owner']
                    if(note.ownerid == req.cookies['recordID']) {
                        res.render('note-view', { note: note, mynote: mynote, owner: owner }) // Specific notes: visiting my notes
                    } else {
                        mynote = false
                        res.render('note-view', { note: note, mynote: mynote, owner: owner }) // Specific notes: visiting others notes
                    }
                }).catch(err => {
                    next(err)
                })
            } else {
                get_note().then(notes => {
                    res.render('notes-repo', { notes: notes }) //! Notes repository. Created for testing purposes, will be deleted soon
                }).catch(err => {
                    next(err)
                })
            }
        } else {
            res.redirect('/login')
        }
    })

    return router
}

module.exports = noteViewRouter