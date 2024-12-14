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
* @description - When a feedback is got, this data will be added in the database 
* @param {string} noteDocID - The *documentID* of the note on which the feedback is given 
* @param {string} commenterDocID - The *documentID* of the commenter
* @param {string} feedbackContents - The text of the feedback
*/
export interface IFeedBackDB {
    noteDocID: string,
    commenterDocID: string,
    feedbackContents: string
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
*/
interface INoteNotifications {
    noteDocID: string,
}

/**
* @description - The `Feedback` notification 
* @param {string} noteDocID - The *documentID* of the note on which the feedback is given 
* @param {string} feedbackDocID - The *documentID* of the feedback
* @param {string} commenterDocID - The *documentID* of the commenter
* @param {string} ownerStudentID - The *documentID* of the owner of the note
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
* @param {string} mentionedStudentID - The *studentID* of the mentioned user
*/
export interface IMentionNotificationDB extends INoteNotifications {
    feedbackDocID: string,
    commenterDocID: string,
    mentionedStudentID: string
}



/**
* @description - Under feedbacks, there will be *replies*. This is `Reply` notification
* @param {string} noteDocID - The *documentID* of the note on which the reply is given 
* @param {string} parentFeedbackDocID - The *documentID* of the feedback on which the reply is given
* @param {string} commenterDocID - The *documentID* of the commenter
* @param {string} ownerStudentID - The *documentID* of the owner of the note
*/
export interface IReplyNotificationDB extends INoteNotifications {
    parentFeedbackDocID: string,
    commenterDocID: string,
    ownerStudentID: string
}