const express = require('express')
const Notes = require('../schemas/notes')
const Students = require('../schemas/students')
const router = express.Router()

function uploadRouter(io) {
    async function add_note(noteObj) {
        let note = await Notes.create(noteObj)
        await Students.findByIdAndUpdate(noteObj.ownerid, { $push: { owned_notes: note._id } }, { upsert: true, new: true })
        return note
    }

    router.get('/', (req, res) => {
        if(req.session.stdid) {
            res.render('upload-note')
        } else {
            res.redirect('/login')
        }
    })

    router.post('/', (req, res, next) => {
        let noteData = {
            ownerid: req.cookies['recordID'],
            subject: req.body['note-subject'],
            title: req.body['note-title'],
            description: req.body['note-description']
        }
        add_note(noteData).then(note => {
            res.redirect('/view')
        }).catch(err => {
            next(err)
        })
    })

    return router
}

module.exports = uploadRouter