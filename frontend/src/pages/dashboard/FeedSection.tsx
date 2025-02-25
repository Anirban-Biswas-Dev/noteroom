import { useEffect, useState } from "react";
import FeedNote from "./FeedNoteCard";
import "../../public/css/dashboard.css";
import '../../public/css/quick-post.css';
import "../../public/css/main-pages.css";
import "../../public/css/share-note.css";

//TODO: Infinite scrolling and dynamic image loading

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
	  const [page, ] = useState(1)

    useEffect(() => {
      async function fetchNotes() {
        try {
          let response = await fetch(`http://127.0.0.1:2000/api/getnote?type=seg&seed=123123412&page=${page}&count=7`);
          let notes = await response.json()
          if (notes.length !== 0) {
            setFeedNotes(notes.map((note: any) => new FeedNoteObject(note)))
          } else {
            console.log(`No notes are left`)
          }
        } catch (error) {
          console.log(error)
        }
      }

      fetchNotes()
    }, [])

    return (
        <>
            <div className="feed-container">
                { feedNotes.map((note) => {
                  return <FeedNote note={note} key={note.noteData.noteID}></FeedNote>
                }) }
            </div>
        </>
    )
}

