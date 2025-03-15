import { useState } from "react"
import { useAppData } from "../../context/AppDataContext"

function NoteCard({ note }: { note: any }) {
	// let description = note.description ? (new DOMParser()).parseFromString(note.description, "text/html").body.textContent?.slice(0, 50) + "..." : ""

	return (
		<div className="note-card" style={{ marginBottom: "10px" }}>
			<img className="profile-note-card-thumbnail" src={note.noteThumbnail || 'https://placehold.co/800x500'} alt="Note Thumbnail" />
			<h3 id="note-title">{note.noteTitle.length > 25 ? `${note.noteTitle.slice(0, 25)}...` : note.noteTitle}</h3>
			{/* <p style={{ padding: "10px 5px" }}>{description}</p> */}
		</div>
	)
}
export default function PostsSection({ user }: { user: any }) {
	enum TabSection { MY_POSTS, SAVED_POSTS }
	const [tab, setTab] = useState<TabSection>(TabSection.MY_POSTS)
	const { savedNotes: [savedNotes,] } = useAppData()

	const NoNotesMessage = () => {
		return (
			<div className="no-notes-content">
				<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" className="feather feather-frown">
					<circle cx="12" cy="12" r="10" stroke-width="1"></circle>
					<path d="M9 9h.01" stroke-width="1"></path>
					<path d="M15 9h.01" stroke-width="1"></path>
					<path d="M9 15a4 4 0 0 1 6 0" stroke-width="1"></path>
				</svg>
				<p className="notes-unavailable">Nothing to see here!</p>
			</div>
		)
	}

	return (
		<div className="uploaded-notes-section">
			<div className="toggle-header-uploaded-notes">
				{!user.owner ? (
					<h2 className="user-notes active-section">
						{user.displayname}'s Posts
					</h2>
				) : (
					<>
						<h2 className={"user-notes " + (tab === TabSection.MY_POSTS ? "active-section" : "")} onClick={() => setTab(TabSection.MY_POSTS)}>My Posts</h2>
						<h2 className={"student-saved-notes " + (tab === TabSection.SAVED_POSTS ? "active-section" : "")} onClick={() => setTab(TabSection.SAVED_POSTS)}>Saved Posts</h2>
					</>
				)}
			</div>
			<div className="notes-container">
				{
					tab === TabSection.MY_POSTS ?
						<>
							{user.owned_posts && user.owned_posts.length !== 0 ? 
								user.owned_posts?.map((post: any, index: number) => {
									return <NoteCard note={post} key={"owned-" + post.noteID} />
								}) : <NoNotesMessage />
							}
						</>
						:
						<>
							{savedNotes.length !== 0 ? 
								savedNotes.map((post: any, index: number) => {
									return <NoteCard note={post} key={"saved-" + post.noteID}/>
								}) : <NoNotesMessage />
							}
						</>
				}
			</div>
		</div>
	)
}