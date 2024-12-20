/*
=> Notes: This files containes the types and interfaces about the data-objects that are required for filling up mongo documents. (REQUIRED FIELDS)
=> Naming Conventions:
~       Interface: I<document-type|collection>DB
*/



/**
* @description - **Students Document**
* @description - When signing up, this user data will be added in the database
*/
export interface IStudentDB {
    displayname: string,
    email: string,
    password: string,
    studentID: string,
    rollnumber: string,
    collegesection: string,
    collegeyear: string,
    bio: string,
    favouritesubject: string,
    notfavsubject: string,
    group: string,
    username: string
}



/**
* @description - **Feedbacks Document**
* @description - This is the standard data structure for a COMMENT on a note
*/
interface ICommentDB {
    noteDocID: string,
    feedbackContents: string
}


/**
* @description - **Feedbacks Document** *Feedback* type
* @description - When a feedback is got, this data will be added in the database 
* @param {string} noteDocID - The *documentID* of the note on which the feedback is given 
* @param {string} commenterDocID - The *documentID* of the commenter
* @param {string} feedbackContents - The text of the feedback
*/
export interface IFeedBackDB extends ICommentDB {
    commenterDocID: string,
}


/**
* @description - **Feedbacks Document** *Reply* Type
* @description - When a reply is got on a feedback, this data will be added in the database 
* @param {string} noteDocID - The *documentID* of the note on which the reply is given 
* @param {string} commenterDocID - The *documentID* of the replier
* @param {string} feedbackContents - The text of the reply
* @param {string} parentFeedbackDocID - The *documentID* of the feedback on which the reply is given
*/
export interface IReplyDB extends ICommentDB {
    commenterDocID: string,
    parentFeedbackDocID: string
}


/**
* @description - This is the initial notedata which is added before the image links
* @param {string} ownerDocID - The owner's *documentID* 
*/
export interface INoteDB {
    ownerDocID: string,
    subject: string,
    title: string,
    description: string
}



/**
* @description - This is the standard structure for notificatins **related to notes** 
* @description - For the note-owner, there will be 2 notifications: *feedbacks* and *reply*. They will be saved via `IFeedbackNotificationDB`. Cause for the note-owner, they are comments
*/
interface INoteNotifications {
    noteDocID: string,
}

/**
* @description - The `Feedback` notification 
* @param {string} noteDocID - The *documentID* of the note on which the feedback is given 
* @param {string} feedbackDocID - The *documentID* of the feedback
* @param {string} commenterDocID - The *documentID* of the commenter
* @param {string} ownerStudentID - The *studentID* of the owner of the notification (for comments, either reply or feedbacks. This will the be the note owner's. Cause he will be getting the comment notification)
*/
export interface IFeedbackNotificationDB extends INoteNotifications {
    feedbackDocID: string,
    commenterDocID: string,
    ownerStudentID: string
}



/**
* @description - The `Mention` notification 
* @param {string} noteDocID - The *documentID* of the note on which the feedback is given 
* @param {string} feedbackDocID - The *documentID* of the feedback
* @param {string} commenterDocID - The *documentID* of the commenter
* @param {string} mentionedStudentID - The *studentID* of the mentioned user.
*/
export interface IMentionNotificationDB extends INoteNotifications {
    feedbackDocID: string,
    commenterDocID: string,
    mentionedStudentID: string
}



/**
* @description - Under feedbacks, there will be *replies*. This is `Reply` notification
* @description - This is only for the user of a feedback. NOT FOR THE NOTE-OWNER. (Saying this to not mix reply notifications for a note-owner. For a note-owner, feedback and reply are same: commentsw)
* @param {string} noteDocID - The *documentID* of the note on which the reply is given 
* @param {string} parentFeedbackDocID - The *documentID* of the feedback on which the reply is given
* @param {string} commenterDocID - The *documentID* of the commenter
* @param {string} ownerStudentID - The *studentID* of the owner of the notification. Here the user who gave the FEEDBACK on which the `commenter` replied
*/
export interface IReplyNotificationDB extends INoteNotifications {
    commenterDocID: string,
    ownerStudentID: string,
    parentFeedbackDocID: string
}