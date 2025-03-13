export interface SavedNoteObject {
    noteID: string,
    noteTitle: string,
	noteThumbnail: string
}

export class NotificationObject {
    notiID: string;
    fromUserSudentDocID: { profile_pic: string, displayname: string } | null;
    content: string;
    isRead: boolean;
    createdAt: string;

    constructor(noti: any) {
        this.notiID = noti._id;
        this.fromUserSudentDocID = noti.fromUserSudentDocID;
        this.content = noti.content;
        this.isRead = noti.isRead;
        this.createdAt = noti.createdAt;
    }
}

export class FeedNoteObject {
	isQuickPost: boolean;
	noteData: any;
	contentData: any;
	ownerData: any;
	interactionData: any;
	extras: any;

	constructor(note: any) {
		this.isQuickPost = note.postType === "quick-post";
		this.noteData = {
			noteID: note._id,
			noteTitle: !this.isQuickPost ? note.title : null,
			description: note.description,
			createdAt: note.createdAt,
		};
		this.contentData = {
			content1:
				this.isQuickPost || note.content.length > 1 ? note.content[0] : null,
			content2: !this.isQuickPost ? note.content[1] : null,
			contentCount: note.content.length,
		};
		this.ownerData = {
			ownerID: note.ownerDocID.studentID,
			profile_pic: note.ownerDocID.profile_pic,
			ownerDisplayName: note.ownerDocID.displayname,
			ownerUserName: note.ownerDocID.username,
			isOwner: note.isOwner,
		};
		this.interactionData = {
			feedbackCount: note.feedbackCount,
			upvoteCount: note.upvoteCount,
			isSaved: note.isSaved,
			isUpvoted: note.isUpvoted,
		};
		this.extras = {
			quickPost: this.isQuickPost,
			pinned: note.pinned,
		};
	}
}