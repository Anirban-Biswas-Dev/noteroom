/**
* @description - This object is sent to the client
*/
export interface IFeedBackNotification {
    noteID /* The note on which the feedback is given: to create a direct link to that note */: string,
    nfnTitle /* The note's title on which the feedback is given: the link will contain the note's title */: string,
    isread: string,

    commenterDisplayName /* The student's displayname who gave the feedback: the link will contain commenter's displayname */: string,
    commenterUserName /* The student's username who gave the feedback: for redirecting directly to the commenter's profile */: string,

    ownerStudentID /* The note-owner's studentID : varifing with studentID cookie to keep/drop notification */: string,

    notiID: /* The document ID of notification. This is used to perform specific tasks on notifications */ string,
    feedbackID /* This is the unique id of each feedback, used for redirection to that specific feedback, used using # */: string
}


// naming: I<notification-type>Notification