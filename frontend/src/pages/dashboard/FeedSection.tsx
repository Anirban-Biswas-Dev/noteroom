import { useCallback, useEffect, useRef, useState } from "react";
import FeedNote from "./FeedNoteCard";
import { useFeed } from "../../context/FeedNoteContext";
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

