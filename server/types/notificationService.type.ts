/*
=> Notes: This file will contain the interfaces and types for the data-objects that are used for general purpose notification services. 
~         Like, the data structures sent via sockets or fetch requests.
=> Naming Convention:
~       Interface: I<notification-type>Notification
*/


export enum ENotificationType {
    Feedback = 'feedback',
    Mention = 'mention',
    Reply = 'reply'
}


/**
 * @description - This is the ideal structure for notifications **related to notes**
 */
export interface ICommentNotification {
    noteID: string,
    nfnTitle: string,
    isread: string,

    commenterDisplayName: string,

    notiID: string,
    feedbackID: string
}

/**
* @description - This object is sent to the client via `notification-feedback` WS event
*/
export interface IFeedBackNotification extends ICommentNotification{
    ownerStudentID /* The note-owner's studentID : varifing with studentID cookie to keep/drop notification */: string,
}


/**
* @description - This object is sent to the client via `notification-mention` WS event
*/
export interface IMentionNotification extends ICommentNotification{
    mentionedStudentID /* The note-owner's studentID : varifing with studentID cookie to keep/drop notification */: string,
    mention: boolean
}

/**
 * @description - This object is sent to the client via `notification-reply` WS event
 */
export interface IReplyNotification extends ICommentNotification{
    ownerStudentID: string,
}