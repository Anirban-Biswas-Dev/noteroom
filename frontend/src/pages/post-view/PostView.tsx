import { useContext, useEffect, useState } from "react";
import { SavedNotesContext } from "../../context/SavedNotesContext";
import { VoteContext } from "../../context/VoteContext";
import { useParams } from "react-router-dom";
import "../../public/css/note-view.css"
import "../../public/css/loaders.css"
import "../../public/css/nav-section.css"
import "../../public/css/main-pages.css"
import "../../public/css/share-note.css"
import { ImageContainer } from "./ImageContainer";
import { NoteEngagement } from "./NoteEngagements";

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
                // let response = await fetch(`http://127.0.0.1:2000/api/note/${postID}/images`)
                // let data = await response.json()
                // if (data.ok && data.images?.length !== 0) {
                //     setNoteImages(data.images)
                // } else {
                //     setNoteImages([])
                // }
                setNoteImages([
                    'https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/906150/pexels-photo-906150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                    'https://images.pexels.com/photos/68507/spring-flowers-flowers-collage-floral-68507.jpeg?auto=compress&cs=tinysrgb&w=600',
                    'https://images.pexels.com/photos/1187079/pexels-photo-1187079.jpeg?auto=compress&cs=tinysrgb&w=600'
                ])
            } catch (error) {
                console.error(error)
            }
        }
        getNoteImages()
    }, [])

    return (
        <div className="middle-section">
            <div className="nav-section">
                <svg className="nav-back-btn" width="20" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z" fill="#1D1B20"/>
                </svg>
            </div>

            <div className="first-box">
                <div className="fb__col-1">
                    <img className="note-author-img" src={ownerProfile?.profile_pic} alt="Author Picture" />
                    <div className="fb__col-1-wrapper-1">
                        <span className="author-name"><a href="">{ownerProfile?.displayname}</a></span>        
                        <h1 className="section-title">{noteData?.title}</h1>
                    </div>
                </div>

                <div className="fb__col-2">
                    <button className="note-view-request-btn db-note-card-request-option">Request</button>
                    {noteData?.postType === "quick-post" || <button className={"save-note-btn " + (isSaveNote ? "saved" : "")} id="save-note-btn" onClick={() => saveNote()}>
                        <svg className="bookmark-fill-white" width="25" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 16.0909V11.0975C21 6.80891 21 4.6646 19.682 3.3323C18.364 2 16.2426 2 12 2C7.75736 2 5.63604 2 4.31802 3.3323C3 4.6646 3 6.80891 3 11.0975V16.0909C3 19.1875 3 20.7358 3.73411 21.4123C4.08421 21.735 4.52615 21.9377 4.99692 21.9915C5.98402 22.1045 7.13673 21.0849 9.44216 19.0458C10.4612 18.1445 10.9708 17.6938 11.5603 17.5751C11.8506 17.5166 12.1494 17.5166 12.4397 17.5751C13.0292 17.6938 13.5388 18.1445 14.5578 19.0458C16.8633 21.0849 18.016 22.1045 19.0031 21.9915C19.4739 21.9377 19.9158 21.735 20.2659 21.4123C21 20.7358 21 19.1875 21 16.0909Z" stroke="#1C274D" stroke-width="1.5"/>
                            <path d="M15 6H9" stroke="#1C274D" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <svg className="bookmark-fill-black" width="25" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M21 11.0975V16.0909C21 19.1875 21 20.7358 20.2659 21.4123C19.9158 21.735 19.4739 21.9377 19.0031 21.9915C18.016 22.1045 16.8633 21.0849 14.5578 19.0458C13.5388 18.1445 13.0292 17.6938 12.4397 17.5751C12.1494 17.5166 11.8506 17.5166 11.5603 17.5751C10.9708 17.6938 10.4612 18.1445 9.44216 19.0458C7.13673 21.0849 5.98402 22.1045 4.99692 21.9915C4.52615 21.9377 4.08421 21.735 3.73411 21.4123C3 20.7358 3 19.1875 3 16.0909V11.0975C3 6.80891 3 4.6646 4.31802 3.3323C5.63604 2 7.75736 2 12 2C16.2426 2 18.364 2 19.682 3.3323C21 4.6646 21 6.80891 21 11.0975ZM8.25 6C8.25 5.58579 8.58579 5.25 9 5.25H15C15.4142 5.25 15.75 5.58579 15.75 6C15.75 6.41421 15.4142 6.75 15 6.75H9C8.58579 6.75 8.25 6.41421 8.25 6Z" fill="#1C274D"/>
                        </svg>
                    </button>}
                </div>
            </div>

            <ImageContainer noteImages={noteImages} controller={[prevImage, nextImage, offset]}></ImageContainer>

            <div className="third-box">
                <div className="third-box__row-1">
                    <div className="fnc__tr--note-engagement-metrics">
                        <div className="love-react-metric-wrapper">
                            <svg className="love-react-icon-static" width="30" height="27" viewBox="0 0 30 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M27.5227 2.53147C26.7991 1.80756 25.94 1.2333 24.9944 0.841502C24.0489 0.449705 23.0354 0.248047 22.0119 0.248047C20.9883 0.248047 19.9748 0.449705 19.0293 0.841502C18.0837 1.2333 17.2246 1.80756 16.501 2.53147L14.9994 4.03313L13.4977 2.53147C12.0361 1.0699 10.0538 0.248804 7.98685 0.248804C5.91989 0.248804 3.93759 1.0699 2.47602 2.53147C1.01446 3.99303 0.193359 5.97534 0.193359 8.0423C0.193359 10.1093 1.01446 12.0916 2.47602 13.5531L14.9994 26.0765L27.5227 13.5531C28.2466 12.8296 28.8209 11.9705 29.2126 11.0249C29.6044 10.0793 29.8061 9.06582 29.8061 8.0423C29.8061 7.01878 29.6044 6.00528 29.2126 5.05971C28.8209 4.11415 28.2466 3.25504 27.5227 2.53147Z" fill="url(#paint0_linear_4170_1047)" />
                                <defs>
                                    <linearGradient id="paint0_linear_4170_1047" x1="-53.407" y1="-16.9324" x2="14.9989" y2="40.0465" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#04DBF7" />
                                        <stop offset="1" stopColor="#FF0000" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="love-react-metric-count metric-count-font uv-count">{upvoteCount}</span>
                        </div>
                    </div>

                    <NoteEngagement upvote={upvote} controller={[upvoteManage]}></NoteEngagement>

                    <h3 className="desc-label">Description</h3>
                </div>
                <div className="desc-content" dangerouslySetInnerHTML={{__html: noteData?.description}}></div>
            </div>
        </div>
    )
}