import { useContext, useEffect, useState } from "react";
import { SavedNotesContext } from "../../context/SavedNotesContext";
import { VoteContext } from "../../context/VoteContext";
import { useParams } from "react-router-dom";
import { ImageContainer } from "./ImageContainer";
import { NoteEngagement } from "./NoteEngagements";
import CommentsContainer from "./CommentsContainer";
import "../../public/css/note-view.css"
import "../../public/css/loaders.css"
import "../../public/css/nav-section.css"
import "../../public/css/main-pages.css"
import "../../public/css/share-note.css"
import CommentEditor from "./CommentBox";
import PostHeader from "./PostHeader";

export default function PostView() {
    const [noteImages, setNoteImages] = useState<string[]>([])
    const [noteData, setNoteData] = useState<any>()
    const [ownerProfile, setOwnerProfile] = useState<any>()
    const [offset, setOffset] = useState<number>(0)
    const [upvoteCount, setUpvoteCount] = useState<number>(0)
    const [upvote, setUpvote] = useState<boolean>()
    const [isSaveNote, setIsSaveNote] = useState<boolean>(false)
    const [, , saveNoteFunction] = useContext(SavedNotesContext)
    const [upvoteFunction] = useContext(VoteContext)
    const { postID } = useParams()

    const nextImage = () => setOffset(currentIndex => (currentIndex + 1) % noteImages.length)
    const prevImage = () => setOffset(currentIndex => (currentIndex - 1 + noteImages.length) % noteImages.length)
    
    async function upvoteManage() {
        upvoteFunction({noteID: postID, studentID: "9181e241-575c-4ef3-9d3c-2150eac4566d"}, [upvote, setUpvote], [upvoteCount, setUpvoteCount])
    }

    async function saveNote() {
        saveNoteFunction({ noteID: postID, noteTitle: noteData.title }, [isSaveNote, setIsSaveNote])
    }
    
    useEffect(() => {
        async function getNoteData() {
            try {
                let response = await fetch(`http://127.0.0.1:2000/api/note/${postID}/metadata`)
                let data = await response.json()
                if (data.ok) {
                    let { note, owner } = data.noteData
                    setNoteData(note)
                    setOwnerProfile(owner)
                    setUpvoteCount(note.upvoteCount)
                    setUpvote(note.isUpvoted)
                    setIsSaveNote(note.isSaved)
                }
            } catch (error) {
                console.error(error)
            }
        }
        getNoteData()

        async function getNoteImages() {
            try {
                let response = await fetch(`http://127.0.0.1:2000/api/note/${postID}/images`)
                let data = await response.json()
                if (data.ok && data.images?.length !== 0) {
                    setNoteImages(data.images)
                } else {
                    setNoteImages([])
                }
                // setNoteImages([
                //     'https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                //     'https://images.pexels.com/photos/906150/pexels-photo-906150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                //     'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                //     'https://images.pexels.com/photos/68507/spring-flowers-flowers-collage-floral-68507.jpeg?auto=compress&cs=tinysrgb&w=600',
                //     'https://images.pexels.com/photos/1187079/pexels-photo-1187079.jpeg?auto=compress&cs=tinysrgb&w=600'
                // ])
            } catch (error) {
                console.error(error)
            }
        }
        getNoteImages()
    }, [])
        
    return (
        <div className="middle-section">
            <div className="post-container">
                <PostHeader owner={ownerProfile} isSaveNote={isSaveNote} controller={[saveNote]} isQuickPost={noteData?.postType === 'quick-post'}></PostHeader>

                <div className="post-content">
                    <h1 className="post-title">{noteData?.title}</h1>
                    <div className="post-description" dangerouslySetInnerHTML={{__html: noteData?.description}}></div>
                    <ImageContainer noteImages={noteImages} controller={[prevImage, nextImage, offset]}></ImageContainer>
                </div>

                <NoteEngagement upvote={upvote} controller={[upvoteManage]} upvoteCount={upvoteCount} isQuickPost={noteData?.postType === 'quick-post'}></NoteEngagement>
                <CommentsContainer postID={postID}></CommentsContainer>
            </div>
        </div>
    )
}