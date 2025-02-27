import { useCallback, useEffect, useRef, useState } from "react";
import FeedNote from "./FeedNoteCard";


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
	const [feedNotes, setFeedNotes] = useState<FeedNoteObject[]>([])
	const [page, setPage] = useState(1)
	const [loading, setLodaing] = useState(false)
	const [hasMore, setHasMore] = useState(true)

	const observer = useRef<IntersectionObserver | null>(null)
	
	const lastNoteRef = useCallback((node: any) => {
		if (loading) return
		if (observer.current) observer.current.disconnect()

		observer.current = new IntersectionObserver(async (entries: IntersectionObserverEntry[]) => {
			if (entries[0].isIntersecting && hasMore) {
				await fetchNotes()
			}
		})

		if (node) observer.current.observe(node)
	}, [loading])

	async function fetchNotes() {
		setLodaing(true)
		try {
			let response = await fetch(`http://127.0.0.1:2000/api/getnote?type=seg&seed=123123412&page=${page}&count=10`);
			let notes = await response.json()
			if (notes.length !== 0) {
				setLodaing(false)
				setFeedNotes(prev => [...prev, ...notes.map((note: any) => new FeedNoteObject(note))])
				setPage(prev => prev + 1)
			} else {
				setLodaing(false)
				setHasMore(false)
				return
			}
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		fetchNotes()
	}, [])

	return (
		<>		
			<div className="feed-container">
				{feedNotes.map((note, index) => {
					return <FeedNote note={note} key={note.noteData.noteID} ref={feedNotes.length === index + 1 ? lastNoteRef : null}></FeedNote>
				})}

				{ loading && <p>Loading...</p>}
			</div>
		</>
	)
}

