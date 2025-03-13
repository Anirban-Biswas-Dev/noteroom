import { createContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImageContainer } from "./ImageContainer";
import { NoteEngagement } from "./NoteEngagements";
import PostHeader from "./PostHeader";
import { FeedNoteObject } from "../../types/types";
import { useFeed } from "../../context/FeedNoteContext";
import CommentsContainer from "./CommentsContainer";
import "../../public/css/note-view.css"
import "../../public/css/loaders.css"
import "../../public/css/nav-section.css"
import "../../public/css/main-pages.css"
import "../../public/css/share-note.css"


export const PostContext = createContext<any>(null)

export default function PostView() {
    const { feedNotes, controller: [upvoteNote, saveNote] } = useFeed()

    const [noteImages, setNoteImages] = useState<string[]>([])
    const [offset, setOffset] = useState<number>(0)
    const { postID } = useParams()
    
    const [noteData, setNoteData] = useState<any>(null)
    
    const nextImage = () => setOffset(currentIndex => (currentIndex + 1) % noteImages.length)
    const prevImage = () => setOffset(currentIndex => (currentIndex - 1 + noteImages.length) % noteImages.length)
    
    useEffect(() => {
        async function getNoteData() {
            try {
                const noteData = feedNotes.find((note: any) => note.noteData.noteID === postID)
                if (noteData) {
                    setNoteData(noteData)
                } else {
                    let response = await fetch(`http://127.0.0.1:2000/api/note/${postID}/metadata`)
                    let data = await response.json()
                    if (data.ok) {
                        let note = new FeedNoteObject(data.noteData)
                        setNoteData(note)   
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }
        getNoteData()
    }, [feedNotes, postID])
    
    useEffect(() => {
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
    }, [postID])
        
    return (
        <PostContext.Provider value={{noteData, controller: [upvoteNote, saveNote]}}>
            <div className="middle-section">
                <div className="post-container">
                    <PostHeader></PostHeader>

                    <div className="post-content">
                        <h1 className="post-title">{noteData?.noteData.noteTitle}</h1>
                        <div className="post-description" dangerouslySetInnerHTML={{__html: noteData?.noteData.description}}></div>
                        <ImageContainer noteImages={noteImages} controller={[prevImage, nextImage, offset]}></ImageContainer>
                    </div>

                    <NoteEngagement></NoteEngagement>
                    <CommentsContainer></CommentsContainer>
                </div>
            </div>
        </PostContext.Provider>
    )
}