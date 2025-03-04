function PostAction({ isSaveNote, isQuickPost, controller: [saveNote] }: any) {
    return (
        <div className="post-header__actions">
            <button className="request-btn db-note-card-request-option">Request</button>
            { 
                !isQuickPost ? 
                    <button className={"save-btn " + (isSaveNote ? "saved" : "")} onClick={() => saveNote()}>
                        <svg className="bookmark-outline" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 3H7C5.89543 3 5 3.89543 5 5V21L12 18L19 21V5C19 3.89543 18.1046 3 17 3Z" stroke="#1D1B20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg className="bookmark-filled" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 3H7C5.89543 3 5 3.89543 5 5V21L12 18L19 21V5C19 3.89543 18.1046 3 17 3Z" fill="#1D1B20"/>
                        </svg>
                    </button> : ''
            } 
        </div>
    )
}

export default function PostHeader({ owner, isSaveNote, isQuickPost, controller: [saveNote]}: any) {
    return (
        <div className="post-header">
            <div className="post-header__info">
                <svg className="nav-back-btn" width="20" height="auto" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z" fill="#1D1B20"/>
                </svg>
                <img className="post-author-pic" src={owner?.profile_pic} alt="Author Picture" />
                <span className="post-author-name">{owner?.displayname}</span>
            </div>

            <PostAction isSaveNote={isSaveNote} controller={[saveNote]} isQuickPost={isQuickPost}></PostAction>
        </div>
    )
}