/*
=> Notes: This file will contain the interfaces and types for the data-objects that are used for general purpose notification services. 
~         Like, the data structures sent via sockets or fetch requests.
=> Naming Convention:
~       Interface: I<notification-type>Notification
*/



//FIXME: These two interfaces are almost same, except one field. will make them more useable and short
/**
* @description - This object is sent to the client via `notification-feedback` WS event
*/
export interface IFeedBackNotification {
    noteID /* The note on which the feedback is given: to create a direct link to that note */: string,
    nfnTitle /* The note's title on which the feedback is given: the link will contain the note's title */: string,
    isread: string,

    commenterDisplayName /* The student's displayname who gave the feedback: the link will contain commenter's displayname */: string,

    ownerStudentID /* The note-owner's studentID : varifing with studentID cookie to keep/drop notification */: string,

    notiID: /* The document ID of notification. This is used to perform specific tasks on notifications */ string,
    feedbackID /* This is the unique id of each feedback, used for redirection to that specific feedback, used using # */: string
}


/**
* @description - This object is sent to the client via `notification-mention` WS event
* @notice - This is currently not in use
*/
export interface IMentionNotification {
    noteID /* The note on which the feedback is given: to create a direct link to that note */: string,
    nfnTitle /* The note's title on which the feedback is given: the link will contain the note's title */: string,
    isread: string,

    commenterDisplayName /* The student's displayname who gave the feedback: the link will contain commenter's displayname */: string,

    mentionedStudentID /* The note-owner's studentID : varifing with studentID cookie to keep/drop notification */: string,

    notiID: /* The document ID of notification. This is used to perform specific tasks on notifications */ string,
    feedbackID /* This is the unique id of each feedback, used for redirection to that specific feedback, used using # */: string,
    mention: boolean
}


export interface IReplyNotification {
    noteID: string,
    nfnTitle: string,
    isread: string,

    commenterDisplayName: string,

    ownerStudentID: string,

    notiID: string,
    feedbackID: string,
}