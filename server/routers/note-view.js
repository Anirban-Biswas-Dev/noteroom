const express = require('express')
const router = express.Router()
const Notes = require('../schemas/notes')
const Students = require('../schemas/students')
const feedBackNotifs = require('../schemas/notifications').feedBackNotifs
const allNotifs = require('../schemas/notifications').Notifs
const Feedbacks = require('../schemas/feedbacks')
const { getSavedNotes, getNotifications, getRoot } = require('./controller')

/*
# Variables: (commenter / owner)
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
        // If the noteDocID is given in the url, the specific note will be shown. 
        if (noteDocID) {
            let note = await Notes.findById(noteDocID, { title: 1, subject: 1, description: 1, ownerDocID: 1, content: 1 })
            let owner = await Students.findById(note.ownerDocID, { displayname: 1, studentID: 1, profile_pic: 1, username: 1 }) 
            let feedbacks = await Feedbacks.find({ noteDocID: note._id })
                .populate('commenterDocID', 'displayname username studentID profile_pic').sort({ createdAt: -1 }) 

            return { note: note, owner: owner, feedbacks: feedbacks }
        }
    }
    
    async function addFeedback(feedbackObj) {
        let feedback = await Feedbacks.create(feedbackObj)
        let feedbackStudents = await Feedbacks.findById(feedback._id)
            .populate('commenterDocID', 'displayname username studentID profile_pic') 
            .populate('noteDocID', 'title')
         // Populating with some basic info of the commenter and the notes to send that to all the users via websockets

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

            let feedbackNoti = await addFeedbackNotifications({
                noteDocID: noteDocID, 
                commenterDocID: commenterDocID, 
                feedbackDocID: feedback._id,
                ownerUsername: ownerUsername
            }) // Save the feedback notifications in database

            io.emit('feedback-given', { //* Feedback-notifications: This will go to everyuser, but the user with ownerUsername=recordName will keep it
                noteID /* The note on which the feedback is given: to create a direct link to that note */: noteDocID,
                nfnTitle /* The note's title on which the feedback is given: the link will contain the note's title */: feedback.noteDocID.title, 
                commenterStudentID /* Commenter's student-id: to create a direct link to the commenter's profile */: feedback.commenterDocID.studentID, 
                commenterDisplayName /* The student's displayname who gave the feedback: the link will contain commenter's displayname */ : feedback.commenterDocID.displayname,
                ownerUsername /* The student's username who ownes the note: varifing with recordName if the notification will be dropped or not */: ownerUsername,
                notiID: /* The document ID of notification. This is used to remove specific notifications later */ feedbackNoti._id,
                feedbackID /* This is the unique id of each feedback, used for redirection to that specific feedback*/ : feedback._id
            })
        })
    })

    router.get('/:noteID?', async (req, res, next) => {
        try {
            let noteDocID = req.params.noteID
            let information = await getNote(noteDocID)
            let root = await getRoot(Students, req.session.stdid, 'studentID', { displayname: 1, username: 1, profile_pic: 1 })
            let [note, owner, feedbacks] = [information['note'], information['owner'], information['feedbacks']]
            if (req.session.stdid) {
                let mynote = 1 //* Varifing if a note is mine or not: corrently using for not allowing users to give feedbacks based on some situations (self-notes and viewing notes without being logged in)
                if (noteDocID) {
                    let savedNotes = await getSavedNotes(Students, Notes, req.session.stdid)
                    let notis = await getNotifications(allNotifs, req.cookies['recordName'])
                    if (note.ownerDocID == req.cookies['recordID']) {
                        res.render('note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis }) // Specific notes: visiting my notes
                    } else {
                        mynote = 0
                        res.render('note-view', { note: note, mynote: mynote, owner: owner, feedbacks: feedbacks, root: root, savedNotes: savedNotes, notis: notis }) // Specific notes: visiting others notes
                    }
                }
            } else {
                res.render('note-view', { note: note, mynote: 3, owner: owner, feedbacks: feedbacks, root: owner }) // Specific notes: visiting notes without being logged in
            }
        } catch (error) {
            next(error)
        }
    })

    router.get('/:noteID/shared', async (req, res, next) => {
        let headers = req.headers['user-agent']
        let noteDocID = req.params.noteID
        let note = (await getNote(noteDocID)).note

        if(headers.includes('facebook')) {
            res.render('shared', { note: note, req: req })
        } else {
            res.redirect(`/view/${noteDocID}`)
        }
    })

    return router
}

module.exports = noteViewRouter
