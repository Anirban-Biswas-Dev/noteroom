import { useCallback, useEffect, useRef, useState } from "react";
import FeedNote from "./FeedNoteCard";
import { useFeed } from "../../context/FeedNoteContext";


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

export default function FeedSection() {
	const { feedNotes, loading, lastNoteRef } = useFeed()!

	return (
		<>		
			<div className="feed-container">
				{feedNotes?.map((note: any, index: number) => {
					return <FeedNote note={note} key={note.noteData.noteID} ref={feedNotes.length === index + 1 ? lastNoteRef : null}></FeedNote>
				})}

				{ loading && <p>Loading...</p>}
			</div>
		</>
	)
}

