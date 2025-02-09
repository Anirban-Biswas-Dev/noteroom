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
    password: string | null,
    studentID: string,
    rollnumber?: string,
    collegesection?: string,
    collegeyear?: string,
    bio?: string,
    favouritesubject?: string,
    notfavsubject?: string,
    group?: string,
    username: string,
    authProvider: string | null,
    onboarded: boolean
}



/**
 * @description - This is the initial notedata which is added before the image links
 * @param {string} ownerDocID - The owner's `documentID`
 */
export interface INoteDB {
    ownerDocID: string,
    subject: string,
    title: string,
    description: string
}

export interface IQuickPostDB {
    ownerDocID: string,
    description: string,
    content?: any[],
    postType?: 'quick-post'
}


/* ------------------- Note Engagement Section ------------------- */

/**
* @description - **Feedbacks Document**
* @description - This is the standard data structure for a COMMENT on a note
 * @param {string} noteDocID - The `documentID` of the note on which the reply is given
 * @param {string} feedbackContents - The text of the reply
*/
interface ICommentDB {
    noteDocID: string,
    feedbackContents?: string
}


/**
* @description - **Feedbacks Document** of type **Feedback**
* @description - When a feedback is got, this data will be added in the database 
* @param {string} commenterDocID - The `documentID` of the commenter
*/
export interface IFeedBackDB extends ICommentDB {
    commenterDocID: string,
}


/**
* @description - **Feedbacks Document** of type **Reply**
* @description - When a reply is got on a feedback, this data will be added in the database 
* @param {string} commenterDocID - The `documentID` of the replier
* @param {string} parentFeedbackDocID - The `documentID` of the feedback on which the reply is given
*/
export interface IReplyDB extends ICommentDB {
    commenterDocID: string,
    parentFeedbackDocID: string
}



export interface IVoteDB {
    noteDocID?: string,
    voterStudentDocID: string,
    voteType?: "upvote" | "downvote",
}

export interface ICommentVoteDB extends IVoteDB {
    feedbackDocID: string
}




/* ------------------- Notifications Section ------------------- */

/**
 * @description - This is the standard structure for notificatins **related to notes**
 * @description - Notifications will be filtered using either `ownerStudentID` or `mentionedStudentID` (for mentions). That means, these fields will be the studentID of the users **who will get the notification**
*/
interface INoteNotificationsDB {
    noteDocID: string,
    content: string
}


export interface INoteUploadConfirmationNotificationDB extends INoteNotificationsDB {
    ownerStudentID: string
}


/**
 * @description - This is the ideal structure for notifications **related to comments** (reply, feedack, mentions) **on notes**
 * @param {string} feedbackDocID - The `documentID` of the comment
 * @param {string} commenterDocID - The `documentID` of the commenter who gave the comment
 */
export interface ICommentNotificationDB extends INoteNotificationsDB {
    feedbackDocID: string,
    commenterDocID: string
}

/**
* @description - The `Feedback` notification 
* @param {string} ownerStudentID - The `studentID` of the owner of the note (for comments, either reply or feedbacks. This will be the note owner's. Cause he will be getting the comment notification)
*/
export interface IFeedbackNotificationDB extends ICommentNotificationDB {
    ownerStudentID: string
}

/**
* @description - The `Mention` notification 
* @param {string} mentionedStudentID - The *studentID* of the mentioned user.
*/
export interface IMentionNotificationDB extends ICommentNotificationDB {
    mentionedStudentID: string
}



/**
* @description - The `Reply` notification
* @description - This is only for the user of a feedback. NOT FOR THE NOTE-OWNER. For the note-owner, reply/feedbacks will be considered as replies
* @param {string} parentFeedbackDocID - The `documentID` of the feedback on which the reply is given
* @param {string} ownerStudentID - The `studentID` of **the user who gave the feedback** on which a commenter replied
*/
export interface IReplyNotificationDB extends ICommentNotificationDB {
    ownerStudentID: string,
    parentFeedbackDocID: string,
}


export interface IUpVoteNotificationDB {
    noteDocID: string,
    voteDocID: string,
    voterDocID: string,
    ownerStudentID: string,
    content: string
}


export interface IGeneralNotificationDB {
    ownerStudentID: string,
    title: string,
    content: string
}