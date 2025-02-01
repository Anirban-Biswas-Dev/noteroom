const conHost = window.location.origin
const conSock = io(conHost)

//* Badge images: user-profile + search-profile
let baseURL = 'https://storage.googleapis.com/noteroom-fb1a7.appspot.com/badges/'
let imageObject = {
    'No Badge': `${baseURL}no-badge.png`,
    'Biology': `${baseURL}biology.png`,
    'English': `${baseURL}english.png`
}

let savedNoteObserver = new MutationObserver(entries => {
    let entry = entries[0]
    if (entry.addedNodes.length > 0) {
        document.querySelector('.no-saved-notes-message').classList.add('hide')
    }
})
savedNoteObserver.observe(document.querySelector('.saved-notes-container'), { childList: true })

window.addEventListener('load', () => {
    function addSavedNotes() {
        let savedNotes = manageDb.get('savedNotes')
        savedNotes.then(notes => {
            notes.forEach(note => {
                manageNotes.addSaveNote(note)
            })
        })    
    }
    addSavedNotes()
})


let toastData = (type, message, timer=2000) => {
    return {
        toast: true,
        position: "bottom-end",
        icon: type,
        title: message,
        timer: timer,
        timerProgressBar: true,
        showConfirmButton: false
    }
}


//* Description or Bio truncater function
function truncatedTitle(title) {
    const titleCharLimit = 30;
    let truncatedTitle =
        title.length > titleCharLimit
            ? title.slice(0, titleCharLimit) + "..."
            : title;
    return truncatedTitle
}


const db = new Dexie("Notes")
db.version(6).stores({
    savedNotes: "++id,noteID,noteTitle,noteThumbnail",
    notis: "++id,notiID,feedbackID,isread,noteID,nfnTitle,commenterUsername,commenterDisplayname",
    notes: "++id,noteID,thumbnail,profile_pic,noteTitle,feedbackCount,ownerDisplayName,ownerID,ownerUserName"
})

/**
* @param {string} store - 'savedNotes' or 'notis'
* @param {Object} obj - The object to store
*/
const manageDb = {
    /**
    * @description For **savedNotes** store, `obj` = { noteID, noteTitle }
    * @description For **notis** store, `obj` = { notiID, feedbackID, isread, noteID, nfnTitle, commenterUserName, commenterDisplayName }
    * @description For **notes** store, `obj` = { noteID, thumbnail, profile_pic, noteTitle, ownerDisplayName, ownerID, ownerUserName }
    */
    async add(store, obj) {
        switch (store) {
            case 'savedNotes':
                let existingNote = await db.savedNotes.where("noteID").equals(obj._id).first()
                if (!existingNote) {
                    await db.savedNotes.add({
                        noteID: obj._id,
                        noteTitle: obj.title,
                        noteThumbnail: obj.thumbnail
                    })
                }
                break
            case 'notis':
                let existingNoti = await db.notis.where("notiID").equals(obj.notiID).first()
                if (!existingNoti) {
                    await db.notis.add({
                        notiID: obj.notiID,
                        feedbackID: obj.feedbackID,
                        isread: true, //! this needs to be dynamic. this has to be sent via feedback-given WS event
                        noteID: obj.noteID,
                        nfnTitle: obj.nfnTitle,
                        commenterUserName: obj.commenterUserName,
                        commenterDisplayName: obj.commenterDisplayName
                    })
                }
                break
            case 'notes':
                let existingUNote = await db.notes.where("noteID").equals(obj.noteID).first()
                if (!existingUNote) {
                    await db.notes.add({
                        noteID: obj.noteID,
                        thumbnail: obj.thumbnail,
                        profile_pic: obj.profile_pic,
                        noteTitle: obj.noteTitle,
                        feedbackCount: obj.feedbackCount,
                        ownerDisplayName: obj.ownerDisplayName,
                        ownerID: obj.ownerID,
                        ownerUserName: obj.ownerUserName
                    })
                }
                break
        }
    },

    /**
    * @param {string} id
    * @description For **savedNotes** | **notes** = `noteID`, for **notis** = `notiID`
    */
    async get(store, id) {
        switch (store) {
            case 'savedNotes':
                if (id === undefined) {
                    let allNotes = await db.savedNotes.toArray()
                    return allNotes
                } else {
                    let note = await db.savedNotes.where("noteID").equals(id).first()
                    return note
                }
            case 'notis':
                if (id === undefined) {
                    let allNotis = await db.notis.toArray()
                    return allNotis
                } else {
                    let noti = await db.notis.where("notiID").equals(id).first()
                    return noti
                }
            case 'notes':
                if (id === undefined) {
                    let allNotes = await db.notes.toArray()
                    return allNotes
                } else {
                    let note = await db.notes.where("noteID").equals(id).first()
                    return note
                }
        }
    },

    /**
    * @param {string} id
    * @description For **savedNotes** | **notes** = `noteID`, for **notis** = `notiID`
    */
    async delete(store, id) {
        switch (store) {
            case 'savedNotes':
                let note = await db.savedNotes.where("noteID").equals(id).first()
                await db.savedNotes.delete(note.id)
                break
            case 'notis':
                let noti = await db.notis.where("notiID").equals(id).first()
                await db.notis.delete(noti.id)
                break
            case 'notes':
                let unote = await db.notes.where("noteID").equals(id).first()
                await db.notes.delete(unote.id)
                break
        }
    }
}


async function upvote(voteContainer, fromDashboard = false) {
    if (voteContainer.getAttribute('data-disabled')) return

    voteContainer.setAttribute('data-disabled', 'true')

    const voterStudentID = Cookies.get("studentID")
    const noteDocID = voteContainer.getAttribute('data-noteid')
    const isUpvoted = voteContainer.getAttribute('data-isupvoted') === "true" ? true : false
    const voteCard = fromDashboard ? document.querySelector(`#note-${noteDocID}`) : document
    
    let uvCount = voteCard.querySelector('.uv-count')
    const DOWNVOTE_SVG = `
        <path d="M26.0497 5.76283C25.4112 5.12408 24.6532 4.61739 23.8189 4.27168C22.9845 3.92598 22.0903 3.74805 21.1872 3.74805C20.2841 3.74805 19.3898 3.92598 18.5555 4.27168C17.7211 4.61739 16.9631 5.12408 16.3247 5.76283L14.9997 7.08783L13.6747 5.76283C12.385 4.47321 10.636 3.74872 8.81216 3.74872C6.98837 3.74872 5.23928 4.47321 3.94966 5.76283C2.66005 7.05244 1.93555 8.80154 1.93555 10.6253C1.93555 12.4491 2.66005 14.1982 3.94966 15.4878L14.9997 26.5378L26.0497 15.4878C26.6884 14.8494 27.1951 14.0913 27.5408 13.257C27.8865 12.4227 28.0644 11.5284 28.0644 10.6253C28.0644 9.72222 27.8865 8.82796 27.5408 7.99363C27.1951 7.15931 26.6884 6.40127 26.0497 5.76283Z" stroke="#1E1E1E" stroke-width="0.909091" stroke-linecap="round" stroke-linejoin="round"/>
    `
    const UPVOTE_SVG = `<path d="M27.5227 2.53147C26.7991 1.80756 25.94 1.2333 24.9944 0.841502C24.0489 0.449705 23.0354 0.248047 22.0119 0.248047C20.9883 0.248047 19.9748 0.449705 19.0293 0.841502C18.0837 1.2333 17.2246 1.80756 16.501 2.53147L14.9994 4.03313L13.4977 2.53147C12.0361 1.0699 10.0538 0.248804 7.98685 0.248804C5.91989 0.248804 3.93759 1.0699 2.47602 2.53147C1.01446 3.99303 0.193359 5.97534 0.193359 8.0423C0.193359 10.1093 1.01446 12.0916 2.47602 13.5531L14.9994 26.0765L27.5227 13.5531C28.2466 12.8296 28.8209 11.9705 29.2126 11.0249C29.6044 10.0793 29.8061 9.06582 29.8061 8.0423C29.8061 7.01878 29.6044 6.00528 29.2126 5.05971C28.8209 4.11415 28.2466 3.25504 27.5227 2.53147Z" fill="url(#paint0_linear_4170_1047)"/>
        <defs>
        <linearGradient id="paint0_linear_4170_1047" x1="-53.407" y1="-16.9324" x2="14.9989" y2="40.0465" gradientUnits="userSpaceOnUse">
        <stop stop-color="#04DBF7"/>
        <stop offset="1" stop-color="#FF0000"/>
        </linearGradient>
        </defs>`

    
    let voteData = new FormData()
    voteData.append('noteDocID', noteDocID)
    voteData.append('voterStudentID', voterStudentID)
    
    function replaceUpvoteArrow(svg, increment) {
        voteCard.querySelector('#upvote-container .uv-icon').innerHTML = svg
        voteCard.querySelector('.uv-count').innerHTML = parseInt(uvCount.innerHTML) + (increment ? 1 : -1)
        voteContainer.setAttribute('data-isupvoted', !isUpvoted)
    }

    const url = `/view/${noteDocID}/vote?type=upvote${isUpvoted ? '&action=delete' : ''}`
    replaceUpvoteArrow(isUpvoted ? DOWNVOTE_SVG : UPVOTE_SVG, !isUpvoted)
    
    let response = await fetch(url, {
        body: voteData,
        method: 'post'
    })
    let data = await response.json()
    if (data.ok) {
        voteContainer.removeAttribute('data-disabled')
    } else {
        Swal.fire(toastData('error', "Yikes! Try again later.", 3000))
    }
}


//* The main dynamic content loading manager object
const manageNotes = {
    formatDate: function(dateString) {
        let date = new Date(dateString)
        const formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Dhaka',
            hour12: true
        });
        return formatter.format(date);
    },
    addQuickPost: function(note) {
        let existingPost = document.querySelector(`#note-${note.noteID}`)
        let feedContainer = document.querySelector('.feed-container')

        if (!existingPost) {
            let postHtml = `
                <div class="feed-note-card" id="note-${note.noteID}" data-posttype='quick-post'>
                    <div class="fnc__first-row">
                    <div class="fnc__fr-author-img-wrapper">
                        <img src="${note.profile_pic}" class="fnc__fr-author-img" onclick="window.location.href='/user/${note.ownerUserName}'"/>
                    </div>
                    <div class="fnc__fr-note-info-wrapper">
                        <div class="note-info-wrapper--first-row">
                            <div class="niw--fr-first-col">
                                <div class="niw--fr-first-col-fr">
                                    <a class="author-prfl-link" href="/user/${note.ownerUserName}">${note.ownerDisplayName}</a>
                                    <span class="niw--fr-first-col-fr-seperator"></span>
                                    <a href="" class="db-note-card-request-option">Request</a>
                                </div>
                                <span class="niw--fr-first-col-note-pub-date">${(new Date(note.createdAt)).toDateString()}</span>
                            </div>

                            <div class="niw--fr-second-col">
                                <div class="note-menu">
                                    <button class="note-menu-btn">
                                        <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                                    </button>
                                    <div class="menu-options">
                                        <div class="option" onclick="setupShareModal('${note.noteID}', true)">
                                            <svg
                                                class="share-icon"
                                                width="40"
                                                height="40"
                                                viewBox="0 0 46 46"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                d="M30.6079 32.5223L27.8819 29.8441L36.6816 21.0444L27.8819 12.2446L30.6079 9.56641L42.0858 21.0444L30.6079 32.5223ZM3.82599 36.3483V28.6963C3.82599 26.05 4.7506 23.8023 6.59983 21.953C8.48094 20.0719 10.7446 19.1314 13.391 19.1314H25.2037L18.3169 12.2446L21.0429 9.56641L32.5209 21.0444L21.0429 32.5223L18.3169 29.8441L25.2037 22.9574H13.391C11.7968 22.9574 10.4418 23.5153 9.32584 24.6312C8.20993 25.7471 7.65197 27.1022 7.65197 28.6963V36.3483H3.82599Z"
                                                fill="#1D1B20"
                                                ></path>
                                            </svg>
                                            <span class="opt-label">Share</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="note-info-wrapper--second-row">
                            <p class="fnc--note-desc">${(new DOMParser()).parseFromString(note.description, 'text/html').querySelector('body').textContent.trim()}</p>
                        </div>
                    </div>
                    </div>
                    <div class="fnc__second-row">
                        ${ note.contentCount !== 0 ? 
                            `<div class="quickpost-thumbnail-wrapper">
                                <img class="quickpost-thumbnail" src="" data-src="${note.content1}"/>
                            </div>`: ``
                        }
                    </div>

                    <div class="fnc__third-row">
                        <div class="fnc__tr--note-engagement-metrics">
                            <div class="love-react-metric-wrapper">
                                <svg
                                    class="love-react-icon-static"
                                    width="30"
                                    height="27"
                                    viewBox="0 0 30 27"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                    d="M27.5227 2.53147C26.7991 1.80756 25.94 1.2333 24.9944 0.841502C24.0489 0.449705 23.0354 0.248047 22.0119 0.248047C20.9883 0.248047 19.9748 0.449705 19.0293 0.841502C18.0837 1.2333 17.2246 1.80756 16.501 2.53147L14.9994 4.03313L13.4977 2.53147C12.0361 1.0699 10.0538 0.248804 7.98685 0.248804C5.91989 0.248804 3.93759 1.0699 2.47602 2.53147C1.01446 3.99303 0.193359 5.97534 0.193359 8.0423C0.193359 10.1093 1.01446 12.0916 2.47602 13.5531L14.9994 26.0765L27.5227 13.5531C28.2466 12.8296 28.8209 11.9705 29.2126 11.0249C29.6044 10.0793 29.8061 9.06582 29.8061 8.0423C29.8061 7.01878 29.6044 6.00528 29.2126 5.05971C28.8209 4.11415 28.2466 3.25504 27.5227 2.53147Z"
                                    fill="url(#paint0_linear_4170_1047)"
                                    ></path>
                                    <defs>
                                    <linearGradient
                                        id="paint0_linear_4170_1047"
                                        x1="-53.407"
                                        y1="-16.9324"
                                        x2="14.9989"
                                        y2="40.0465"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stop-color="#04DBF7"></stop>
                                        <stop offset="1" stop-color="#FF0000"></stop>
                                    </linearGradient>
                                    </defs>
                                </svg>
                                <span class="love-react-metric-count metric-count-font uv-count">${note.upvoteCount}</span>
                            </div>
                
                        <div class="review-metric-wrapper">
                            <span
                                class="review-count metric-count-font cmnt-count"
                                onclick="window.location.href='/view/quick-post/${note.noteID}/#feedbacks'"
                            >
                                ${ note.feedbackCount === 0 ? `No reviews yet` : `${note.feedbackCount} Review${note.feedbackCount === 1 ? "" : "s"}`}
                            </span>
                            </div>
                        </div>
            
                        <div class="note-engagement">
                            <div class="uv-container" id="upvote-container" data-isupvoted="${note.isUpvoted}" data-noteid="${note.noteID}" onclick="upvote(this, true)">
                            <svg
                                class="uv-icon"
                                width="18"
                                height="19"
                                viewBox="0 0 22 23"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                ${note.isUpvoted ?  
                                    `<path
                                        d="M27.5227 2.53147C26.7991 1.80756 25.94 1.2333 24.9944 0.841502C24.0489 0.449705 23.0354 0.248047 22.0119 0.248047C20.9883 0.248047 19.9748 0.449705 19.0293 0.841502C18.0837 1.2333 17.2246 1.80756 16.501 2.53147L14.9994 4.03313L13.4977 2.53147C12.0361 1.0699 10.0538 0.248804 7.98685 0.248804C5.91989 0.248804 3.93759 1.0699 2.47602 2.53147C1.01446 3.99303 0.193359 5.97534 0.193359 8.0423C0.193359 10.1093 1.01446 12.0916 2.47602 13.5531L14.9994 26.0765L27.5227 13.5531C28.2466 12.8296 28.8209 11.9705 29.2126 11.0249C29.6044 10.0793 29.8061 9.06582 29.8061 8.0423C29.8061 7.01878 29.6044 6.00528 29.2126 5.05971C28.8209 4.11415 28.2466 3.25504 27.5227 2.53147Z"
                                        fill="url(#paint0_linear_4170_1047)"
                                    />
                                    <defs>
                                    <linearGradient
                                        id="paint0_linear_4170_1047"
                                        x1="-53.407"
                                        y1="-16.9324"
                                        x2="14.9989"
                                        y2="40.0465"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stop-color="#04DBF7" />
                                        <stop offset="1" stop-color="#FF0000" />
                                    </linearGradient>
                                    </defs>`
                                    :
                                    `<path
                                        d="M26.0497 5.76283C25.4112 5.12408 24.6532 4.61739 23.8189 4.27168C22.9845 3.92598 22.0903 3.74805 21.1872 3.74805C20.2841 3.74805 19.3898 3.92598 18.5555 4.27168C17.7211 4.61739 16.9631 5.12408 16.3247 5.76283L14.9997 7.08783L13.6747 5.76283C12.385 4.47321 10.636 3.74872 8.81216 3.74872C6.98837 3.74872 5.23928 4.47321 3.94966 5.76283C2.66005 7.05244 1.93555 8.80154 1.93555 10.6253C1.93555 12.4491 2.66005 14.1982 3.94966 15.4878L14.9997 26.5378L26.0497 15.4878C26.6884 14.8494 27.1951 14.0913 27.5408 13.257C27.8865 12.4227 28.0644 11.5284 28.0644 10.6253C28.0644 9.72222 27.8865 8.82796 27.5408 7.99363C27.1951 7.15931 26.6884 6.40127 26.0497 5.76283Z"
                                        stroke="#1E1E1E"
                                        stroke-width="0.909091"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />`
                                }
                            </svg>
                
                            <span class="fnc__tr--icon-label like-padding-top-5">Like</span>
                            </div>
                            <div class="cmnt-engagement" onclick="window.location.href='/view/quick-post/${note.noteID}/#feedbacks'">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                onclick="window.location.href='/view/quick-post/${note.noteID}/#feedbacks'"
                                class="comment-icon"
                            >
                                <path
                                d="M23.25 15.75C23.25 16.413 22.9866 17.0489 22.5178 17.5178C22.0489 17.9866 21.413 18.25 20.75 18.25H5.75L0.75 23.25V3.25C0.75 2.58696 1.01339 1.95107 1.48223 1.48223C1.95107 1.01339 2.58696 0.75 3.25 0.75H20.75C21.413 0.75 22.0489 1.01339 22.5178 1.48223C22.9866 1.95107 23.25 2.58696 23.25 3.25V15.75Z"
                                stroke="#1E1E1E"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                ></path>
                            </svg>
                
                            <span class="fnc__tr--icon-label">Review</span>
                            </div>
                        </div>
                        </div>
                </div> <br>
            `

            feedContainer.insertAdjacentHTML('beforeend', postHtml);

            let newNoteCard = document.querySelector(`#note-${note.noteID}`)
            observers.observer().observe(newNoteCard)
        }
    },
    addNote: function (note) {
        let existingUNote = document.querySelector(`#note-${note.noteID}`)
        let feedContainer = document.querySelector('.feed-container')

        //FIXME: there should be a skeleton loader for the note card or for the note image
        if (!existingUNote) {
            let noteCardHtml = `
                <div class="feed-note-card" id="note-${note.noteID}">
                    <div class="fnc__first-row">
                        <div class="fnc__fr-author-img-wrapper">
                        <img src="${note.profile_pic}" class="fnc__fr-author-img" onclick="window.location.href='/user/${note.ownerUserName}'"/>
                        </div>
                        <div class="fnc__fr-note-info-wrapper">
                        <div class="note-info-wrapper--first-row">
                            <div class="niw--fr-first-col">
                            <div class="niw--fr-first-col-fr">
                                <a class="author-prfl-link" href="/user/${note.ownerUserName}">${note.ownerDisplayName}</a>
                                <span class="niw--fr-first-col-fr-seperator"></span>
                                <a href="" class="db-note-card-request-option">Request</a>
                            </div>
                            <span class="niw--fr-first-col-note-pub-date">${(new Date(note.createdAt)).toDateString()}</span>
                            </div>

                            <div class="niw--fr-second-col">
                                <div class="note-menu">
                                    <button class="note-menu-btn">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <div class="menu-options">    
                                        <div class="option svn-btn-parent" id="save-btn-${note.noteID}" onclick="saveNote(this, true)" data-notetitle="${note.noteTitle}" data-noteid="${note.noteID}" data-issaved="${note.isSaved}">
                                            <button class="${note.isSaved ? "saved" : ""} save-note-btn" id="save-note-btn">
                                                <i class="fa-regular fa-bookmark"></i>
                                                <i class="fa-solid fa-bookmark saved"></i>
                                            </button>
                                            <span class="opt-label">Save Note</span>
                                        </div>


                                        <div class="option" onclick="download('${note.noteID}', '${note.noteTitle}')">
                                                <svg
                                                    class="download-icon"
                                                    width="40"
                                                    height="40"
                                                    viewBox="0 0 43 43"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                <path
                                                    d="M37.1541 26.5395V33.6165C37.1541 34.555 36.7813 35.455 36.1177 36.1186C35.4541 36.7822 34.5541 37.155 33.6156 37.155H8.84623C7.90776 37.155 7.00773 36.7822 6.34414 36.1186C5.68054 35.455 5.30774 34.555 5.30774 33.6165V26.5395M12.3847 17.6933L21.2309 26.5395M21.2309 26.5395L30.0771 17.6933M21.2309 26.5395V5.30859"
                                                    stroke="#1E1E1E"
                                                    stroke-width="2.29523"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                />
                                            </svg>
                                            <span class="opt-label">Download</span>
                                        </div>
                                        <div class="option" onclick="setupShareModal(window.location.pathname)"
                                            >
                                            <svg
                                            class="share-icon"
                                            width="40"
                                            height="40"
                                            viewBox="0 0 46 46"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                        <path
                                            d="M30.6079 32.5223L27.8819 29.8441L36.6816 21.0444L27.8819 12.2446L30.6079 9.56641L42.0858 21.0444L30.6079 32.5223ZM3.82599 36.3483V28.6963C3.82599 26.05 4.7506 23.8023 6.59983 21.953C8.48094 20.0719 10.7446 19.1314 13.391 19.1314H25.2037L18.3169 12.2446L21.0429 9.56641L32.5209 21.0444L21.0429 32.5223L18.3169 29.8441L25.2037 22.9574H13.391C11.7968 22.9574 10.4418 23.5153 9.32584 24.6312C8.20993 25.7471 7.65197 27.1022 7.65197 28.6963V36.3483H3.82599Z"
                                            fill="#1D1B20"
                                        />
                                                </svg>
                                            <span class="opt-label">Share</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        
                        <div class="note-info-wrapper--second-row">
                            <p class="fnc--note-desc">
                                ${(new DOMParser()).parseFromString(note.description, 'text/html').querySelector('body').textContent.trim().slice(0, 100)}...
                                <span class="note-desc-see-more-btn" onclick="window.location.href='/view/${note.noteID}'">Read More</span>
                            </p>
                        </div>
                        </div>
                    </div>


                    <div class="fnc__second-row">
                        <div class="thumbnail-grid" style="display: none;">
                            <img class="thumbnail primary-img" src="" onclick="window.location.href='/view/${note.noteID}'" data-src='${note.content1}'/>
                            <div class="thumbnail-secondary-wrapper">
                                <img class="thumbnail secondary-img" src="" onclick="window.location.href='/view/${note.noteID}'" data-src='${note.content2}'/>
                                ${ note.contentCount > 2 ? 
                                    `<div class="thumbnail-overlay" onclick="window.location.href='/view/${note.noteID}'">+${parseInt(note.contentCount) - 2}</div>` : ''
                                }
                            </div>
                        </div>
                    </div>

                    <div class="fnc__third-row">
                            <div class="fnc__tr--note-engagement-metrics">
                                <div class="love-react-metric-wrapper">
                                    <svg 
                                        class="love-react-icon-static" 
                                        width="30" 
                                        height="27" 
                                        viewBox="0 0 30 27" 
                                        fill="none" 
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M27.5227 2.53147C26.7991 1.80756 25.94 1.2333 24.9944 0.841502C24.0489 0.449705 23.0354 0.248047 22.0119 0.248047C20.9883 0.248047 19.9748 0.449705 19.0293 0.841502C18.0837 1.2333 17.2246 1.80756 16.501 2.53147L14.9994 4.03313L13.4977 2.53147C12.0361 1.0699 10.0538 0.248804 7.98685 0.248804C5.91989 0.248804 3.93759 1.0699 2.47602 2.53147C1.01446 3.99303 0.193359 5.97534 0.193359 8.0423C0.193359 10.1093 1.01446 12.0916 2.47602 13.5531L14.9994 26.0765L27.5227 13.5531C28.2466 12.8296 28.8209 11.9705 29.2126 11.0249C29.6044 10.0793 29.8061 9.06582 29.8061 8.0423C29.8061 7.01878 29.6044 6.00528 29.2126 5.05971C28.8209 4.11415 28.2466 3.25504 27.5227 2.53147Z"
                                            fill="url(#paint0_linear_4170_1047)"
                                        />
                                        <defs>
                                            <linearGradient
                                                id="paint0_linear_4170_1047"
                                                x1="-53.407"
                                                y1="-16.9324"
                                                x2="14.9989"
                                                y2="40.0465"
                                                gradientUnits="userSpaceOnUse"
                                            >
                                            <stop stop-color="#04DBF7" />
                                            <stop offset="1" stop-color="#FF0000" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <span class="love-react-metric-count metric-count-font uv-count">${note.upvoteCount}</span>
                                </div>

                                <div class="review-metric-wrapper">
                                    <span
                                        class="review-count metric-count-font cmnt-count"
                                        onclick="window.location.href='/view/${note.noteD}/#feedbacks'"
                                    >
                                        ${ note.feedbackCount === 0 ? `No reviews yet` : `${note.feedbackCount} Review${note.feedbackCount === 1 ? "" : "s"}`}
                                    </span>
                                </div>
                                </div>

                                <!-- First Row of Third FNC row -->
                                <div class="note-engagement">
                                <div
                                    class="uv-container"
                                    id="upvote-container"
                                    data-isupvoted="${note.isUpvoted}"
                                    data-noteid="${note.noteID}"
                                    onclick="upvote(this, true)"
                                >
                                    <svg
                                        class="uv-icon"
                                        width="18"
                                        height="19"
                                        viewBox="0 0 22 23"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                    ${note.isUpvoted ?  
                                        `<path
                                            d="M27.5227 2.53147C26.7991 1.80756 25.94 1.2333 24.9944 0.841502C24.0489 0.449705 23.0354 0.248047 22.0119 0.248047C20.9883 0.248047 19.9748 0.449705 19.0293 0.841502C18.0837 1.2333 17.2246 1.80756 16.501 2.53147L14.9994 4.03313L13.4977 2.53147C12.0361 1.0699 10.0538 0.248804 7.98685 0.248804C5.91989 0.248804 3.93759 1.0699 2.47602 2.53147C1.01446 3.99303 0.193359 5.97534 0.193359 8.0423C0.193359 10.1093 1.01446 12.0916 2.47602 13.5531L14.9994 26.0765L27.5227 13.5531C28.2466 12.8296 28.8209 11.9705 29.2126 11.0249C29.6044 10.0793 29.8061 9.06582 29.8061 8.0423C29.8061 7.01878 29.6044 6.00528 29.2126 5.05971C28.8209 4.11415 28.2466 3.25504 27.5227 2.53147Z"
                                            fill="url(#paint0_linear_4170_1047)"
                                        />
                                        <defs>
                                        <linearGradient
                                            id="paint0_linear_4170_1047"
                                            x1="-53.407"
                                            y1="-16.9324"
                                            x2="14.9989"
                                            y2="40.0465"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop stop-color="#04DBF7" />
                                            <stop offset="1" stop-color="#FF0000" />
                                        </linearGradient>
                                        </defs>`
                                        :
                                        `<path
                                            d="M26.0497 5.76283C25.4112 5.12408 24.6532 4.61739 23.8189 4.27168C22.9845 3.92598 22.0903 3.74805 21.1872 3.74805C20.2841 3.74805 19.3898 3.92598 18.5555 4.27168C17.7211 4.61739 16.9631 5.12408 16.3247 5.76283L14.9997 7.08783L13.6747 5.76283C12.385 4.47321 10.636 3.74872 8.81216 3.74872C6.98837 3.74872 5.23928 4.47321 3.94966 5.76283C2.66005 7.05244 1.93555 8.80154 1.93555 10.6253C1.93555 12.4491 2.66005 14.1982 3.94966 15.4878L14.9997 26.5378L26.0497 15.4878C26.6884 14.8494 27.1951 14.0913 27.5408 13.257C27.8865 12.4227 28.0644 11.5284 28.0644 10.6253C28.0644 9.72222 27.8865 8.82796 27.5408 7.99363C27.1951 7.15931 26.6884 6.40127 26.0497 5.76283Z"
                                            stroke="#1E1E1E"
                                            stroke-width="0.909091"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />`
                                        }
                                    </svg>
                                    <span class="fnc__tr--icon-label like-padding-top-5">Like</span>
                                </div>

                                <div
                                    class="cmnt-engagement"
                                    onclick="window.location.href='/view/${note.noteID}/#feedbacks'"
                                >
                                    <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    onclick="window.location.href='/view/${note.noteID}/#feedbacks'"
                                    class="comment-icon"
                                    >
                                    <path
                                        d="M23.25 15.75C23.25 16.413 22.9866 17.0489 22.5178 17.5178C22.0489 17.9866 21.413 18.25 20.75 18.25H5.75L0.75 23.25V3.25C0.75 2.58696 1.01339 1.95107 1.48223 1.48223C1.95107 1.01339 2.58696 0.75 3.25 0.75H20.75C21.413 0.75 22.0489 1.01339 22.5178 1.48223C22.9866 1.95107 23.25 2.58696 23.25 3.25V15.75Z"
                                        stroke="#1E1E1E"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    </svg>
                                    <span class="fnc__tr--icon-label">Review</span>
                                </div>
                                </div>
                            </div>
                    </div>
                </div> <br>
            `

            feedContainer.insertAdjacentHTML('beforeend', noteCardHtml);

            let newNoteCard = document.querySelector(`#note-${note.noteID}`)
            observers.observer().observe(newNoteCard)
        }
    },
    addSaveNote: function (noteData) {
        let savedNotesContainer = document.querySelector(".saved-notes-container");
        let existingNote = document.querySelector(`#saved-note-${noteData.noteID}`)

        if (!existingNote) {
            let savedNotesHtml = `
                <div class="saved-note hide" id="saved-note-${noteData.noteID}">
                    <span class="sv-note-title">
                        <a class="sv-n-link" href='/view/${noteData.noteID}'>${truncatedTitle(noteData.noteTitle)}</a>
                    </span>
                </div>`;
            savedNotesContainer.insertAdjacentHTML('afterbegin', savedNotesHtml);
            const newNote = document.getElementById(`saved-note-${noteData.noteID}`);

            // Remove the hide class and add the transition class after a short delay
            setTimeout(() => {
                if (newNote) {
                    newNote.classList.remove('hide');
                    newNote.classList.add('show-sv-in-LP');
                }
            }, 50);
        }
    },

    removeSaveNote: function(noteData) {
        let existingNote = document.querySelector(`#saved-note-${noteData.noteID}`)
        if (existingNote) {
            existingNote.remove()
        }
    },

    addNoti: function (notiData) {
        let notificationContainer = document.querySelector('.notifications-container');
        let existingNoti = document.querySelector(`#noti-${notiData.notiID}`);

        if (!existingNoti) {
            let isInteraction = notiData.fromUserSudentDocID ? true : false;
            let notificationHtml = `
                <div class="notification secondary-${notiData.isread}" id="noti-${notiData.notiID}">
                    ${isInteraction ? `
                        <div class="noti__first-col--img-wrapper">
                            <img src="${notiData.fromUserSudentDocID.profile_pic}" alt="notification" class="noti__source-user-img">
                        </div>` : ''}
                    <div class="noti__sec-col--msg-wrapper" onclick="window.location.href='${notiData.redirectTo}'">
                        <div class="noti__sc--first-row-msg">
                            <p class="noti-msg secondary-${notiData.isread}">
                                ${isInteraction ? `<span class="noti-source-user-name">${notiData.fromUserSudentDocID.displayname}</span>` : ''}
                                ${notiData.content}
                            </p>
                        </div>
                        <div class="noti__sc--second-row-noti-info">
                            <span class="isRead ${notiData.isread}"></span>
                            <span class="noti-time secondary-${notiData.isread}">${this.formatDate(notiData.createdAt)}</span>
                        </div>
                    </div>
                </div>`;
            notificationContainer.insertAdjacentHTML('afterbegin', notificationHtml);
        }
    },

    addProfile: function (student) {
        let profileCard = `
                    <div class="results-prfl">
                        <img src="${student.profile_pic}" alt="Profile Pic" class="prfl-pic">
                        <span class="prfl-name" onclick="window.location.href = '/user/${student.username}'">${student.displayname}</span>
                        <span class="prfl-desc">${truncatedTitle(student.bio)}</span>
                        <span class="badge" style="display: none;">${student.badge}</span>
                        <img src="" alt="" class="user-badge">
                    </div>`
        document.querySelector('.results-prfls').insertAdjacentHTML('beforeend', profileCard);
    },

    addFeedback: function (feedbackData) {
        /*
        # feedbackData:
            => _id: document id of that feedback
            => feedbackContents
            => commenterDocID:
                ~ profile_pic
                ~ username
                ~ displayname
                
        */
        
        let isTemporary = feedbackData.temporary

        let feedbackCard = `
        <div class='main-cmnt-container' data-temporary=${isTemporary}>
            <div class="main__author-threadline-wrapper">
                ${!isTemporary ? `
                    <img
                        src="${feedbackData.commenterDocID.profile_pic}"
                        alt="User Avatar"
                        class="main__cmnt-author-img cmnt-author-img"
                    />
                ` : ''}
                <div class="thread-line"></div>
             </div>
            <div class="main__cmnts-replies-wrapper">
                <div class="main__body cmnt-body-3rows">
                    <div class="main__reply-info reply-info">
                        <span id="parentFeedbackDocID" style="display: none;">${feedbackData._id}</span>
                        <span id="commenterUsername" style="display: none;">${feedbackData.commenterDocID.username}</span>

                        <span class="main__author-name">${feedbackData.commenterDocID.displayname}</span>
                        <span class="reply-date">${this.formatDate(feedbackData.createdAt)}</span>
                    </div>
                    <div class="main__reply-msg reply-msg">${isTemporary ? 'Sending feedback...<div class="search-results-loader"></div>' : feedbackData.feedbackContents }</div>
                    ${!isTemporary ? `
                        <div class="main__engagement-opts engagement-opts">
                            <div class="like-wrapper" data-noteid=${feedbackData.noteDocID._id} data-feedbackid=${feedbackData._id} data-isupvoted="false" onclick="upvoteComment(this)">   
                                <svg class="like-icon" width="20" height="22" viewBox="0 0 115 117" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M107.498 49.9985C107.998 49.9985 109.994 52.6188 109.494 70.581C108.994 88.5431 93.5 110.998 88.993 110.998C84.4861 110.998 28.4996 112 28.493 110.455C28.4863 108.91 28.4938 47.5373 28.4938 47.5373L49.9956 32.4996C49.9956 32.4996 53.0332 25.5652 57.9956 8.99958C62.958 -7.56607 78.4744 33.916 66 49.9982M107.498 49.9985C106.998 49.9985 66 49.9982 66 49.9982M107.498 49.9985L66 49.9982" stroke="#606770" stroke-width="10" stroke-linecap="round"/>
                                </svg>

                                <span class="like-count">${feedbackData.upvoteCount}</span>
                            </div>
                                
                            <svg 
                                class="reply-icon thread-opener"
                                data-tippy-content="Reply"
                                width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" stroke-width="1.14582" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>                    
                        </div>
                    ` : ''}
                </div>

                <div class="thread-section" id="thread-${feedbackData._id}"></div>
            </div>
        </div>
      `;
        document.querySelector(".cmnts-list").insertAdjacentHTML('afterbegin', feedbackCard)
    },

    addReply: function (threadSection, replyData) {
        /*
        => createdAt
        => feedbackContents
        => commenterDocID 
            => profile_pic
            => username
            => displayname
        */
        let isTemporary = replyData.temporary

        replyMessage = `
        <div class='thread-msg' data-temporary=${isTemporary}>
            ${!isTemporary ? `<img src="${replyData.commenterDocID.profile_pic}" alt="User Avatar" class="cmnt-author-img thread-avatar">` : '' }
            <div class="cmnt-body-3rows">
                <div class="reply-info">
                    <span id="commenterUsername" style="display: none;">${replyData.commenterDocID.username}</span>
                    <span class="main__author-name">${replyData.commenterDocID.displayname}</span>
                    <span class="reply-date">${this.formatDate(replyData.createdAt)}</span>
                </div>
                <div class="reply-msg">${isTemporary ? 'Sending reply...<div class="search-results-loader"></div>' : replyData.feedbackContents}</div>
                <div class="main__engagement-opts engagement-opts">
                ${!isTemporary ? `
                    <svg class="reply-icon thread-opener" data-tippy-content="Reply" width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" stroke-width="1.14582" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>` : ''
                }                    
                </div>
            </div>
        </div>
        `;
        let threadEditor = threadSection.querySelector('.thread-editor-container');
        if (!threadEditor) {

            threadEditor = document.createElement('div');
            threadEditor.classList.add('thread-editor-container');

            // Add the HTML for the thread editor
            threadEditor.innerHTML = `
            <!--<img class="tec__avatar-preview thread-avatar">-->
            <div class="thread-editor-wrapper">
                <textarea placeholder="Write a comment..." class="thread-editor"></textarea>
                <div class="thread-editor__action-opts">
                    <svg id="threadCmntBtn" class="thread__cmnt-btn" width="18px" height="18px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
                    <path d="M231.626,128a16.015,16.015,0,0,1-8.18262,13.96094L54.53027,236.55273a15.87654,15.87654,0,0,1-18.14648-1.74023,15.87132,15.87132,0,0,1-4.74024-17.60156L60.64746,136H136a8,8,0,0,0,0-16H60.64746L31.64355,38.78906A16.00042,16.00042,0,0,1,54.5293,19.44727l168.915,94.59179A16.01613,16.01613,0,0,1,231.626,128Z"/>
                    </svg>
                </div>
            </div>
            `;

            threadSection.appendChild(threadEditor);
        }
        threadSection.querySelector('.thread-editor-container').insertAdjacentHTML('beforebegin', replyMessage);
    },

    addNoteProfile: function (noteData, noteType) {
        let notesContainer = document.querySelector(noteType === 'saved' ? '.sv-notes-container' : '.notes-container')
        let noteElementID = `${noteType === 'saved' ? "sv-note" : "own-note"}-${noteData.noteID}`
        let existingNote = notesContainer.querySelector(`#${noteElementID}`)

        if (!existingNote) {
            let noteCard = `
                <div class="note-card" id="${noteElementID}">
                    <a href="/view/${noteData.noteID}">
                        <h3>
                            ${noteData.noteTitle > 30 ? noteData.noteTitle.slice(0, 30) : noteData.noteTitle }
                        </h3>
                        <img src='${noteData.noteThumbnail}' alt="No thumbnail?!">
                    </a>
                </div>`
            notesContainer.insertAdjacentHTML('afterbegin', noteCard);
        }
    },

    addAllFeedback: function(feedback) {
	    let commentsContainer = document.querySelector('.cmnts-list')

        let template = `
			<div class="main__author-threadline-wrapper">
				<img src="${feedback[0].commenterDocID.profile_pic}" alt="User Avatar" class="main__cmnt-author-img cmnt-author-img" />
				<div class="thread-line"></div>
			</div>

			<div class='main__cmnts-replies-wrapper'>
				<div class="main__body cmnt-body-3rows">
					<div class="main__reply-info reply-info"> 
            			<span id="parentFeedbackDocID" style="display: none;">${feedback[0]._id}</span>
        				<span id="commenterUsername" style="display: none;">${feedback[0].commenterDocID.username}</span> 
						<span class="main__author-name">${feedback[0].commenterDocID.displayname}</span>
						<span class="reply-date">${this.formatDate(feedback[0].createdAt)}</span>
					</div>
					<div class='reply-msg'>${feedback[0].feedbackContents}</div>
					<div class="main__engagement-opts engagement-opts">
						<div class="like-wrapper" data-noteid='${feedback[0].noteDocID}' data-feedbackid="${feedback[0]._id}" data-isupvoted="${feedback[0].isUpVoted}" onclick="upvoteComment(this)">
							<svg class="like-icon" data-tippy-content="Like" width="20" height="22" viewBox="0 0 115 117" fill="none" xmlns="http://www.w3.org/2000/svg">
								${
									feedback[0].isUpVoted ? 
        								`<path class='like-icon-fill' d="M28.4938 47.5373C28.4938 47.5373 28.4863 108.91 28.493 110.455C28.4996 112 84.4861 110.998 88.993 110.998C93.5 110.998 108.994 88.5431 109.494 70.581C109.994 52.6188 107.998 49.9985 107.498 49.9985L66 49.9982C78.4744 33.916 62.958 -7.56607 57.9956 8.99958C53.0332 25.5652 49.9956 32.4996 49.9956 32.4996L28.4938 47.5373Z" fill="black"/>`:
										`<path d="M107.498 49.9985C107.998 49.9985 109.994 52.6188 109.494 70.581C108.994 88.5431 93.5 110.998 88.993 110.998C84.4861 110.998 28.4996 112 28.493 110.455C28.4863 108.91 28.4938 47.5373 28.4938 47.5373L49.9956 32.4996C49.9956 32.4996 53.0332 25.5652 57.9956 8.99958C62.958 -7.56607 78.4744 33.916 66 49.9982M107.498 49.9985C106.998 49.9985 66 49.9982 66 49.9982M107.498 49.9985L66 49.9982" stroke="#606770" stroke-width="10" stroke-linecap="round"/>`
								}
							</svg>
							<span class="like-count">${feedback[0].upvoteCount}</span>
						</div>
						<svg class="reply-icon thread-opener" data-tippy-content="Reply" width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" stroke-width="1.14582" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</div>
				</div>

				<div class='thread-section' id='thread-${feedback[0]._id}'>
					${feedback[1].map(reply => {
						return `
						<div class='thread-msg'>
							<img src="${reply.commenterDocID.profile_pic}" alt="User Avatar" class="cmnt-author-img thread-avatar">
							<div class="cmnt-body-3rows">
								<div class="reply-info">
        							<span id="commenterUsername" style="display: none;">${reply.commenterDocID.username}</span> 
									<span class="main__author-name">${reply.commenterDocID.displayname}</span>
									<span class="reply-date">${this.formatDate(reply.createdAt)}</span>
								</div>
								<div class="reply-msg">${reply.feedbackContents}</div>

								<div class="main__engagement-opts engagement-opts">
									<svg class="reply-icon thread-opener" data-tippy-content="Reply" width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" stroke-width="1.14582" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</div>
							</div>
						</div>
						`
					})}
				</div>
			</div>
		`

        let mainCommentContainer = document.createElement('div')
		mainCommentContainer.classList.add('main-cmnt-container')
		mainCommentContainer.innerHTML = template
        commentsContainer.appendChild(mainCommentContainer)
    }
}


//* Download: Dashboard + Note View
async function download(noteID, noteTitle) {
    /* 
    # Process:
    ~   the noteID and title are given when clicking the download button. After getting them, a fetch request is sent
    ~   the server processes that and in that meantime, the animation is started and run until it gets downloaded.
    ~   all the images are sent in a zip file and the zip is then downloaded.
    */

    start() // start of animation

    try {
        let noteDetailes = new FormData()
        noteDetailes.append('noteID', noteID)
        noteDetailes.append('noteTitle', noteTitle)

        let response = await fetch('/api/download', {
            method: 'POST',
            body: noteDetailes
        })

        let blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.setAttribute('download', `${noteTitle}.zip`)

        document.body.appendChild(link)
        link.click()
        link.remove()

        URL.revokeObjectURL(url)
    } catch (error) {
        console.error(error)
    } finally {
        finish() // end of animation
    }
}
function start() {
    document.querySelector('.download-status').style.display = 'flex'
}
function finish() {
    document.querySelector('.download-status').style.display = 'none'
}



/* 
* Share Model: Dashboard + Note View
# Funtions:
    => copy: copies the url of the note (copyLink)
    => share: shares the note in fb or whatsapp (share)
        # process
    ~       when fb/wp is clicked, the platform is also sent, the link from the _link_ element is grabed (1) and based on 
    ~       the platform a share link is created and a new window is opened to share the link. (2)
*/
const linkElement = document.querySelector('._link_');
function setupShareModal(location, isPost=false) {
    const shareNoteModal = document.querySelector('.share-note-overlay');
    const closeNoteModalBtn = document.querySelector('.close-share-note-modal');

    if (!shareNoteModal || !closeNoteModalBtn || !linkElement) {
        console.error('One or more required elements are not found');
        return;
    }

    // Open the modal and populate the link (immediate execution)
    shareNoteModal.style.display = 'flex';
    linkElement.innerHTML = !isPost ? `${window.location.origin}view/${location}` : `${window.location.origin}/view/quick-post/${location}`;
    requestAnimationFrame(() => {
        shareNoteModal.classList.add('visible');
    });

    closeNoteModalBtn.addEventListener('click', () => {
        shareNoteModal.classList.remove('visible');
        setTimeout(() => {
            shareNoteModal.style.display = 'none';
        }, 300); // Matches CSS transition duration
    });
}
function copyLink() {
    const linkElement = document.querySelector('._link_');
    const successfulLinkMsg = document.querySelector('.successful-copy');

    navigator.clipboard.writeText(linkElement.textContent)
        .then(() => {

            successfulLinkMsg.style.display = 'flex';

            requestAnimationFrame(() => {
                successfulLinkMsg.classList.add('s-c-effect');
            });

            setTimeout(() => {
                successfulLinkMsg.classList.remove('s-c-effect');
                setTimeout(() => {
                    successfulLinkMsg.style.display = 'none';
                }, 400);
            }, 2000);

        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}
function share(platform) {
    const linkElement = document.querySelector('._link_').innerHTML; // 1
    let messages = [
        `Check out this note on NoteRoom: ${linkElement}`,
        `Explore this amazing note on NoteRoom: ${linkElement}`,
        `Take a look at this note I found on NoteRoom: ${linkElement}`,
        `Don't miss this note on NoteRoom! Check it out here: ${linkElement}`,
        `Here's something worth reading on NoteRoom: ${linkElement}`,
        `Check out this awesome note on NoteRoom: ${linkElement}`,
        `I came across this great note on NoteRoom, have a look: ${linkElement}`,
        `Found something interesting on NoteRoom! See it here: ${linkElement}`,
        `This note on NoteRoom is worth your time: ${linkElement}`,
        `Take a moment to check out this note on NoteRoom: ${linkElement}`,
        `Here's a note you'll find interesting on NoteRoom: ${linkElement}`
    ]

    switch (platform) {
        case "facebook":
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkElement + '/shared')}`, '_blank') // 2
            break
        case "whatsapp":
            let message = messages[_.random(0, 9)]
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank') // 2
            break
    }
}



async function saveNote(svButton, fromDashboard = false) {
    if (svButton.getAttribute('data-disabled')) return

    svButton.setAttribute('data-disabled', 'true')
    
    let noteTitle = svButton.getAttribute('data-notetitle')
    let noteDocID = svButton.getAttribute('data-noteid')
    
    let noteData = new FormData()
    noteData.append("noteDocID", noteDocID)
    
    let isSaved = svButton.getAttribute('data-issaved')
    let url = `/api/note/save?action=${isSaved === 'true' ? 'delete' : 'save'}`
    let mainsvButton = fromDashboard ? svButton.querySelector('#save-note-btn') : svButton

    const SAVE_SVG = () => mainsvButton.classList.add('saved')
    const UNSAVE_SVG = () => mainsvButton.classList.remove('saved')
    
    function replaceSaveButton() {
        isSaved === 'false' ? SAVE_SVG() : UNSAVE_SVG()
        svButton.setAttribute('data-issaved', isSaved === 'false' ? 'true' : 'false')
    }

    replaceSaveButton()
    manageNotes[isSaved === "true" ? "removeSaveNote" : "addSaveNote"]({ noteTitle, noteID: noteDocID})

    let response = await fetch(url, {
        method: 'post',
        body: noteData
    })
    let body = await response.json()
    if (body.ok) {
        isSaved === "false" ? (async function() {
            Swal.fire(toastData('success', 'Note saved successfully!'))
            await manageDb.add('savedNotes', body.savedNote[0])
        })() : (function() {
            manageDb.delete('savedNotes', noteDocID)
            body.count !== 0 || (document.querySelector('.no-saved-notes-message').classList.remove('hide'))
        })()

        svButton.removeAttribute('data-disabled')
    } else {
        Swal.fire(toastData('error', "Yikes! Try again later.", 3000))
    }
}



//* Search Notes: All Pages
async function searchNotes() {
    /* 
    # Process:
    ~   when the search bar is clicked, an empty dropdown is opened (1). after clicking (either the enter/search button), the text is sent
    ~   to the server via fetch request (2). the server returns possible notes in a json format (3). if there are notes returned, the notes'
    ~   details are added in the dropdown (4). ottherwise, a message is shown that no notes are found (5). Also a loading runs in between the
    ~   note fetching.
    */
    let searchedResults = document.querySelector('.search-results')
    let existingNotes = searchedResults.querySelectorAll('div.results-card')
    let status = document.querySelector('.status')

    if (existingNotes) {
        existingNotes.forEach(note => {
            note.remove()
        })
    }
    let searchTerm = document.querySelector('.search-bar').value
    if (searchTerm.length > 0) {
        status.style.display = 'flex' // Start of loading
        let response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`) // 2
        let notes = await response.json() // 3
        status.style.display = 'none' // End of loading
        if (notes.length > 0) {
            status.style.display = 'none'
            notes.forEach(note => {
                searchedResults.insertAdjacentHTML('afterbegin', `
                    <a href="/view/${note._id}" style="text-decoration: none;">
                        <div class="results-card" id="note-${note._id}">
                            <p class="result-note-title">${note.title}</p>
                            <i class="fa-solid fa-arrow-up"></i>
                        </div>
                    </a>
                `) // 4
            })
        } else {
            searchedResults.insertAdjacentHTML('afterbegin', `
                <div class='results-card'>
                    <p>Oops! No notes found for "${searchTerm}". Try searching with different keywords or explore other subjects!</p>
                </div>
            `) // 5
        }
    }
}

try {
    let searchBtn = document.querySelector('.search-btn');
    let noteSearchInput = document.querySelector('.search-bar');
    let resultsContainer = document.querySelector('.results-container');

    /*
    # Process:
    1. Show the dropdown when the search bar is focused.
    2. Trigger the search when the 'Enter' key is pressed inside the search bar.
    3. Trigger the search when the search button is clicked and prevent dropdown from hiding.
    4. Hide the dropdown if the user clicks outside the search bar or the dropdown.
    5. Prevent the dropdown from hiding when interacting with the dropdown itself.
    */

    // Step 1: Show the results container on input focus
    noteSearchInput.addEventListener('focus', function () {
        resultsContainer.style.display = 'flex'; // Show dropdown
    });

    // Step 2: Trigger search when pressing 'Enter'
    noteSearchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchNotes(); // Call search function
        }
    });

    // Step 3: Prevent dropdown from hiding and trigger search on search button click
    searchBtn.addEventListener('click', function (event) {
        event.stopPropagation(); // Prevent dropdown from hiding
        searchNotes(); // Call search function
    });

    // Step 4: Hide the dropdown if clicking outside of input and results container
    document.addEventListener('click', function (event) {
        if (!noteSearchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
            resultsContainer.style.display = 'none'; // Hide dropdown
        }
    });

    // Step 5: Prevent dropdown from hiding when interacting with the results container
    resultsContainer.addEventListener('click', function (event) {
        event.stopPropagation(); // Stop clicks inside the dropdown from closing it
    });
} catch (error) {
    console.log(error.message)
}





let notificationCount = document.getElementById('notification-count').textContent;
if (notificationCount <= 0) {
    document.getElementById('notification-count').style.display = 'none'
}

//* Delete notifications: all pages
async function deleteNoti(id) {
    /* 
    # Process:
    ~   when clicking the delete noti. button, the notiID is sent. an WS event occurs to delete the notification with that id. (1)
    ~   them that notification is removed from the frontend DOM (2). last, the noti. object is removed from the LS (3)
    */
    conSock.emit('delete-noti', id) // 1
    document.querySelector(`#noti-${id}`).remove() // 2
    await manageDb.delete('notis', id)

    notificationCount--;
    updateNotificationBadge(); // 2
}



//* Adding notifications: all pages

function addNoti(feedbackData) {
    /* 
    # Process: The main function is manageNotes.addNoti. Related to feedback-given WS event
    ~   the noti. data is got via feedback-given WS event. the process handles the main addNoti funnction (1). then the number got increased
    ~   and shown in the noti. badge (2)
    */
    manageNotes.addNoti(feedbackData) // 1
    notificationCount++;
    updateNotificationBadge(); // 2
}
function updateNotificationBadge() {
    const badge = document.getElementById('notification-count');
    if (badge) {
        badge.textContent = notificationCount;
        if (notificationCount > 0) {
            document.getElementById('notification-count').style.display = 'inline-block';
        }
        else {
            document.getElementById('notification-count').style.display = 'none';
        }
    } else {
        console.error('Notification badge element not found');
    }
}


//* Event that will be triggerd when a notification is clicked to make it "read" (true)
let notiLinks = document.querySelectorAll('.notiLink');
notiLinks.forEach(notiLink => {
    notiLink.addEventListener("click", function (event) {
        // Traverse up to the parent notification div (ensuring correct targeting)
        let notiElement = event.currentTarget.closest('.notification');
        if (!notiElement) return; // Ensure notiElement is found
        let notiID = notiElement.getAttribute("id").split("-")[1];
        conSock.emit("read-noti", notiID);
    });
});



try {
    // Mobile notification panel
    // const notificationPanel = document.querySelector('.notification-panel');
    // const notificationButton = document.querySelector('.mobile-nft-btn');
    // const backgroundOverlay = document.querySelector('.background-overlay');
    // const hideNotificationPanel = document.querySelector('.btn-hide-nft');

    // notificationButton.addEventListener('click', () => {
    //     notificationPanel.classList.toggle('show');
    //     backgroundOverlay.classList.toggle('show-overlay');
    // });
    // backgroundOverlay.addEventListener('click', () => {
    //     notificationPanel.classList.remove('show');
    //     backgroundOverlay.classList.remove('show-overlay');
    // });
    // hideNotificationPanel.addEventListener('click', () => {
    //     notificationPanel.classList.remove('show');
    //     backgroundOverlay.classList.remove('show-overlay');
    // })
} catch (error) {
    console.log(error.message)
}



function setupErrorPopup(errorMessage) {
    const errorOverlay = document.querySelector('.error-overlay');
    const closeErrorBtns = document.querySelectorAll('.close-err');
    const errorMsgElement = document.querySelector('.error-msg');

    errorMsgElement.innerHTML = errorMessage || "An unexpected error occurred."; // Default message if none provided. In case someone is playing with the functions on the console :)

    errorOverlay.style.display = 'flex';
    requestAnimationFrame(() => {
        errorOverlay.classList.add('err-visible');
    });

    closeErrorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            errorOverlay.classList.remove('err-visible');
            setTimeout(() => {
                errorOverlay.style.display = 'none';
            }, 300);
        });
    });

    errorOverlay.addEventListener('click', (event) => {
        if (event.target === errorOverlay) {
            closeErrorBtns[0].click();
        }
    });
}

/* || Notification Panel Open Handling */

document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.querySelector(".notification-modal-overlay");
    const modal = document.querySelector(".notification-modal");
    const pcBtn = document.querySelector(".pc-nft-btn");
    const mobileBtn = document.querySelector(".mobile-nft-btn");

    function toggleOverlay() {
        overlay.style.display = (overlay.style.display === "flex") ? "none" : "flex";
    }

    if (pcBtn) { // Ensure the PC button exists
        pcBtn.addEventListener("click", function () {
            console.log("PC Button Clicked!"); // Debug log
            toggleOverlay();
        });
    }

    if (mobileBtn) { // Ensure the mobile button exists
        mobileBtn.addEventListener("click", function () {
            console.log("Mobile Button Clicked!"); // Debug log
            toggleOverlay();
        });
    }

    overlay.addEventListener("click", function (event) {
        if (!modal.contains(event.target)) {
            console.log("Clicked Outside Modal - Closing"); // Debug log
            overlay.style.display = "none";
        }
    });
});


