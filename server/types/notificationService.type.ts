/*
=> Notes: This file will contain the interfaces and types for the data-objects that are used for general purpose notification services. 
~         Like, the data structures sent via sockets or fetch requests.
=> Naming Convention:
~       Interface: I<notification-type>Notification
*/


export enum ENotificationType {
    Feedback = 'note-feedback',
    Mention = 'note-mention',
    Reply = 'note-reply',
    UpVote = 'note-vote'
}


/**
 * @description - This is the ideal structure for notifications **related to notes** which will be sent via web-socket to the clients
 * @param noteID - The `documentID` of the note in which the feedback/reply is given
 * @param nfnTitle - The `title` of the note
 * @param isread - The `state` of the notification (read/unread). This is a string with a value of either "true" or "false"
 * @param commenterDisplayName - The `displayname` of user who gave the feedback/reply
 * @param notiID - The `documentID` of the notification. This can be got after saving the necessary notification using **INoteNotificationDB**
 * @param feedbackID - The `documentID` of the feedback/reply. This can be got after saving the necessary feedback/reply using **ICommentDB**
 */
//FIXME:check if the `isread` is actually needed or not. if needed then make it a boolean
//FIXME:the noteID is not needed anymore, cause the note-title won't contain the note's url
export interface ICommentNotification {
    noteID: string,
    nfnTitle: string,
    isread: string,

    commenterDisplayName: string,

    notiID: string,
    feedbackID: string
}

//FIXME:maybe the ownerStudentID is not needed anymore as the cookie checking for notification is deprecated
/**
* @description - This object is sent to the client via `notification-feedback` WS event.
 * @description - The feedback and the reply notification data are same, so they can be sent with the same web-socket event
*/
export interface IFeedBackNotification extends ICommentNotification{
    ownerStudentID /* The note-owner's studentID : varifing with studentID cookie to keep/drop notification */: string,
}

/**
 * @description - This object is sent to the client via `notification-reply` WS event
 * @description - This notification data is for the user **whose feedback is replied**.
 */
export interface IReplyNotification extends ICommentNotification{
    ownerStudentID: string,
}

/**
* @description - This object is sent to the client via `notification-mention` WS event
*/
//FIXME: check if the `mentionedStudentID` is needed or not, it is maybe as same as ownerStudntID
//FIXME: check if the `mention` field is needed or not
export interface IMentionNotification extends ICommentNotification{
    mentionedStudentID: string,
    mention: boolean
}


/**
* @description - This object is sent to the client via `notification-upvote` WS event
*/
export interface IUpVoteNotification {
    noteID: string,
    nfnTitle: string,
    isread: string,
    notiID: string,
    vote: boolean
}