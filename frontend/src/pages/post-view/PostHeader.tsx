import { useContext, useState } from "react"
import { RequestModal } from "../../partials"
import { PostContext } from "./PostView"
import { useNavigate } from "react-router-dom"

export default function PostHeader() {
    const {noteData, controller: [, saveNote] } = useContext(PostContext)
    const [showReqModal, setShowReqModal] = useState<boolean>(false)
    const navigate = useNavigate()
    const isSaved = noteData?.interactionData.isSaved

    return (
        <div className="post-header">
            <div className="post-header__info">
                <svg className="nav-back-btn" onClick={() => navigate(-1)} width="20" height="auto" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z" fill="#1D1B20"/>
                </svg>
                <img className="post-author-pic" src={noteData?.ownerData.profile_pic} alt="Author Picture" />
                <span className="post-author-name">{noteData?.ownerData.ownerDisplayName}</span>
            </div>

            <div className="post-header__actions">
                <button className="request-btn db-note-card-request-option" onClick={() => setShowReqModal(prev => !prev)}>Request</button>
                { 
                    !(noteData?.isQuickPost) ? 
                        <button className={"save-btn " + (isSaved ? "saved" : "")} onClick={() => saveNote({ noteID: noteData?.noteData.noteID, noteTitle: noteData?.noteData.noteTitle, noteThumbnail: noteData?.contentData.content1}, isSaved)}>
                            <svg className="bookmark-outline" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 3H7C5.89543 3 5 3.89543 5 5V21L12 18L19 21V5C19 3.89543 18.1046 3 17 3Z" stroke="#1D1B20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <svg className="bookmark-filled" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 3H7C5.89543 3 5 3.89543 5 5V21L12 18L19 21V5C19 3.89543 18.1046 3 17 3Z" fill="#1D1B20"/>
                            </svg>
                        </button> : ''
                } 
            </div>

            <RequestModal modalShow={[showReqModal, setShowReqModal]} recipientData={{profile_pic: noteData?.ownerData.profile_pic, displayname: noteData?.ownerData.ownerDisplayName }}></RequestModal>
        </div>
    )
}