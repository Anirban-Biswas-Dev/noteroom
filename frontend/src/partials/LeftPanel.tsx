import { useEffect, useState } from "react"
import { useSavedNotes } from "../context/SavedNotesContext";
import { SavedNoteObject } from "../types/types";
import { Link } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";

function SavedNote({ note }: { note: SavedNoteObject }) {
    return <div className="saved-note">
        <span className="sv-note-title">
            <Link className="sv-n-link" to={"/post/" + note.noteID}><b>{note.noteTitle}</b></Link>
        </span>
    </div>
}


export default function LeftPanel() {
    const [showNoSavedNotesMsg, setShowSavedNotesMsg] = useState(false)
    const { savedNotes: [savedNotes, ] } = useAppData()

    useEffect(() => {
        if (savedNotes?.length === 0) setShowSavedNotesMsg(true)
        else setShowSavedNotesMsg(false)
    }, [savedNotes])

    return (
        <div className="left-panel">
            <div className="left-panel-header">
                <img className="left-panel--nr-logo" alt="NoteRoom Logo" />
                <span className="users-db-msg">NoteRoom</span>
            </div>

            <button className="btn-home">
                <svg width="28" height="28" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <rect width="24.4687" height="24.4687" fill="url(#pattern0_3781_4874)"/>
                    <defs>
                    <pattern id="pattern0_3781_4874" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_3781_4874" transform="scale(0.01)"/>
                    </pattern>
                    <image id="image0_3781_4874" width="100" height="100" xlinkHref="data:image/png;base64,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"/>
                    </defs>
                </svg>
                Home
            </button>

            <button className="btn-upload-note">
                <svg className="btn-upload-note-svg" width="35" height="35" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1010_510)">
                        <path d="M23.6606 22.7891L17.9636 17.0921M17.9636 17.0921L12.2666 22.7891M17.9636 17.0921V29.9104M29.9131 26.1931C31.3022 25.4358 32.3996 24.2374 33.032 22.7871C33.6644 21.3369 33.7959 19.7173 33.4056 18.1841C33.0154 16.6508 32.1256 15.2912 30.8768 14.3197C29.628 13.3483 28.0913 12.8204 26.5091 12.8193H24.7146C24.2835 11.1519 23.48 9.60387 22.3645 8.29165C21.249 6.97942 19.8505 5.93716 18.2742 5.2432C16.6979 4.54924 14.9849 4.22166 13.2637 4.28507C11.5426 4.34848 9.85828 4.80124 8.33734 5.60931C6.8164 6.41739 5.49843 7.55974 4.48253 8.95049C3.46662 10.3412 2.77922 11.9442 2.47199 13.6389C2.16477 15.3335 2.24572 17.0758 2.70875 18.7346C3.17179 20.3935 4.00486 21.9258 5.14534 23.2164" stroke="#1E1E1E" strokeWidth="2.8485" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <defs>
                        <clipPath id="clip0_1010_510">
                        <rect width="34.182" height="34.182" fill="white" transform="translate(0.872559)" />
                        </clipPath>
                    </defs>
                    </svg>
                Upload
            </button>
            
            <span className="sv-header">Saved Notes</span>

            <div className="saved-notes-container">
                {savedNotes?.map((note: any) => {
                    return <SavedNote note={note} key={note.noteID}></SavedNote>
                })}

                <div className="no-saved-notes-message" style={{display: showNoSavedNotesMsg ? 'flex' : "none"}}>
                    <p>It looks like you haven't saved any notes yet. Start saving them to read later</p>
                </div>
            </div>

            <button className="right-panel-btn">Help & Support</button>
            <button className="right-panel-btn">User Guide</button>
        </div>
    )
}