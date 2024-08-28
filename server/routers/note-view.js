const express = require('express')
const router = express.Router()
const Notes = require('../schemas/notes')
const Students = require('../schemas/students')
const Feedbacks = require('../schemas/feedbacks')

function noteViewRouter(io) {
    /*
    //* Getting Notes:
        1. While fetching the notes data, the owner info, the feedbacks related to that notes will be grabed by the help of noteid (the doc id of a note document)
        2. While fetching the feedbacks, populate the studentid (the doc id of the student who commented) with his besic information
        3. Show the notes with the related feedbacks
    //* Posting feedbacks
        1. While posting, the client will give its note-id and student-id (doc-id) with the feedback text
        2. While broadcasting, grab some of the basic info of the commenter by populating the studentid (taken from client-side) field of feedback document
        3. Using websockets to post comments so that it can be transmitted and shown immediately to all the users
        4. Save the feedback (not extented) in the database and then broadcast to all users (also the commenter itself)
    */

    async function getNote(noteID) {
        // If the noteid is given in the url, the specific note will be shown. Otherwise all the notes will be shown //! note repo: will be deleted soon
        if (noteID) {
            let note = await Notes.findById(noteID, { title: 1, subject: 1, description: 1, ownerid: 1, content: 1 })
            let owner = await Students.findById(note.ownerid, { displayname: 1, studentid: 1, profile_pic: 1 }) 
            let feedbacks = await Feedbacks.find({ noteid: note._id }).populate('studentid', 'displayname studentid profile_pic') 
             //* Populating the studentid with some basic info. of the commenter to show in the frontend

            return { note: note, owner: owner, feedbacks: feedbacks }

        } else {
            let notes = await Notes.find({}, { title: 1, subject: 1, description: 1 }) //! note repo: will be removed soon
            return notes
        }
    }

    async function addFeedback(feedbackObj) {
        let feedback = await Feedbacks.create(feedbackObj)
        let feedbackStudents = await Feedbacks.findById(feedback._id).populate('studentid', 'displayname studentid profile_pic') 
         //* Populating with some basic info of the commenter to send that to all the users via websockets

        return feedbackStudents
    }

    io.on('connection', (socket) => {
        socket.on('join-room', room => {
            socket.join(room)
            console.log(`A user added to room: ${room}`)
        })
        socket.on('feedback', (room, feedback, noteid, studentid) => {
            let feedbackData = {
                noteid: noteid,
                studentid: studentid,
                feedbackContents: feedback
            } // Preparing raw data of the feedback
            addFeedback(feedbackData).then(feedback /* The extented-feedback document with commenter info */ => {
                console.log(`Feedback added: ${feedback}`)
                io.to(room).emit('add-feedback', feedback.toObject()) //* Sending extented-feedback to all the users via websockets
            })
        })
    })

    router.get('/:noteID?', (req, res, next) => {
        if (req.session.stdid) {
            let noteID = req.params.noteID
            let mynote = true //* Varifing if a note is mine or not: corrently using for not allowing users to give feedbacks to their own uploaded notes
            if (noteID) {
                getNote(noteID).then(information => {
                    let note = information['note']
                    let owner = information['owner']
                    let feedbacks = information['feedbacks']
                    if (note.ownerid == req.cookies['recordID']) {
                        res.render('note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks }) // Specific notes: visiting my notes
                    } else {
                        mynote = false
                        res.render('note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks }) // Specific notes: visiting others notes
                    }
                }).catch(err => {
                    next(err)
                })
            } else {
                getNote().then(notes => {
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