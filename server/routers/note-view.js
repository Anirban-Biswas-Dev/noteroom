const express = require('express')
const router = express.Router()
const Notes = require('../schemas/notes')
const Students = require('../schemas/students')
const feedBackNotifs = require('../schemas/notifications').feedBackNotifs
const allNotifs = require('../schemas/notifications').Notifs
const Feedbacks = require('../schemas/feedbacks')

/*
Variables: (commenter / owner)
    => noteDocID: note's document ID
    => ownerDocID: note owner's studentDocID
    => studentID -> commenterID: commenter's studentDocID
    => commenterUsername
    => commenterDisplayname
    => ownerUsername
    => commenterStudentID: commenter's studentID
*/

function noteViewRouter(io) {
    async function getNote(noteDocID) {
        // If the noteDocID is given in the url, the specific note will be shown. Otherwise all the notes will be shown //! note repo: will be deleted soon
        if (noteDocID) {
            let note = await Notes.findById(noteDocID, { title: 1, subject: 1, description: 1, ownerDocID: 1, content: 1 })
            let owner = await Students.findById(note.ownerDocID, { displayname: 1, studentID: 1, profile_pic: 1, username: 1 }) 
            let feedbacks = await Feedbacks.find({ noteDocID: note._id })
                .populate('commenterDocID', 'displayname studentID profile_pic') 
             //* Populating the commenter-doc-id with some basic info.

            return { note: note, owner: owner, feedbacks: feedbacks }

        } else {
            let notes = await Notes.find({}, { title: 1, subject: 1, description: 1 }) //! note repo: will be removed soon
            return notes
        }
    }

    async function addFeedback(feedbackObj) {
        let feedback = await Feedbacks.create(feedbackObj)
        let feedbackStudents = await Feedbacks.findById(feedback._id)
            .populate('commenterDocID', 'displayname studentID profile_pic') 
            .populate('noteDocID', 'title')
         //* Populating with some basic info of the commenter and the notes to send that to all the users via websockets

        return feedbackStudents
    }

    async function addFeedbackNotifications(notiObj) {
        let feednoti = await feedBackNotifs.create(notiObj)
        return feednoti
    }

    io.on('connection', (socket) => {
        socket.on('join-room', room => {
            socket.join(room)
            console.log(`A user added to room: ${room}`)
        })
        socket.on('feedback', async (room, feedbackText, noteDocID, commenterDocID, ownerUsername) => {
            let feedbackData = {
                noteDocID: noteDocID,
                commenterDocID: commenterDocID,
                feedbackContents: feedbackText
            } // Preparing raw data of the feedback
            let feedback = await addFeedback(feedbackData) /* The extented-feedback document with commenter info */
            io.to(room).emit('add-feedback', feedback.toObject()) //* Adding feedback under the note view: Sending extented-feedback to all the users via websockets
            io.emit('feedback-given', { //* Feedback-notifications: This will go to everyuser, but the user with ownerUsername=recordName will keep it
                noteDocID /* The note on which the feedback is given: to create a direct link to that note */: noteDocID,
                nfnTitle /* The note's title on which the feedback is given: the link will contain the note's title */: feedback.noteDocID.title, 
                commenterStudentID /* Commenter's student-id: to create a direct link to the commenter's profile */: feedback.commenterDocID.studentID, 
                commenterDisplayName /* The student's displayname who gave the feedback: the link will contain commenter's displayname */ : feedback.commenterDocID.displayname,
                ownerUsername /* The student's username who ownes the note: varifing with recordName if the notification will be dropped or not */: ownerUsername
            })
            let feedbackNoti = await addFeedbackNotifications({
                noteDocID: noteDocID, 
                commenterDocID: commenterDocID, 
                ownerUsername: ownerUsername
            }) // Save the feedback notifications in database
            console.log(feedbackNoti)
        })
    })

    router.get('/:noteID?', (req, res, next) => {
        if (req.session.stdid) {
            let noteDocID = req.params.noteID
            let mynote = true //* Varifing if a note is mine or not: corrently using for not allowing users to give feedbacks to their own uploaded notes
            if (noteDocID) {
                getNote(noteDocID).then(information => {
                    let note = information['note']
                    let owner = information['owner']
                    let feedbacks = information['feedbacks']
                    if (note.ownerDocID == req.cookies['recordID']) {
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