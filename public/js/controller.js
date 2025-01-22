const conHost = window.location.origin
const conSock = io(conHost)

//* Badge images: user-profile + search-profile
let baseURL = 'https://storage.googleapis.com/noteroom-fb1a7.appspot.com/badges/'
let imageObject = {
    'No Badge': `${baseURL}no-badge.png`,
    'Biology': `${baseURL}biology.png`,
    'English': `${baseURL}english.png`
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
db.version(4).stores({
    savedNotes: "++id,noteID,noteTitle",
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
                let existingNote = await db.savedNotes.where("noteID").equals(obj.noteID).first()
                if (!existingNote) {
                    await db.savedNotes.add({
                        noteID: obj.noteID,
                        noteTitle: obj.noteTitle
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


//* The main dynamic content loading manager object
const manageNotes = { // I treat all the cards as notes
    /* 
    # Functions:
        => addNote: adds note in the dashboard
            # process:
        ~       notes are added with this function in 2 scenerios. One is after back_forward and another is lazy loading.
        ~       first the note will be added (1) and then the lazy loading oserver will be triggered for that specific note. (2)
        => addSaveNote: adds note in the left-panel
        => addNoti: adds a notification in the right-panel
        => addProfile: adds profiles when searched in search-profile
        => addFeedback: adds feedback in notes in note-view
    */

    addNote: function (noteData) {
        let existingUNote = document.querySelector(`#note-${noteData.noteID}`)

        if (!existingUNote) {
            let noteCardsHtml = `
                        <div class="feed-note-card" id="note-${noteData.noteID}">
                              <div class="thumbnail-container">
                                  <div class="thumbnail-loading">
                                      <svg className="w-10 h-10" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18">
                                          <path 
                                              d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" 
                                              style="fill: hsl(0, 0%, 80%);" 
                                          />
                                      </svg>
                                  </div>
                                  <img class="thumbnail" data-src="${noteData.thumbnail}" onclick="window.location.href='/view/${noteData.noteID}'" > 
    
                                  <div class="note-menu">
                                <button class="note-menu-btn">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div class="menu-options">
                                    <div class="option svn-btn-parent" id='save-btn-${noteData._id}' onclick="saveNote('${noteData.noteID}', '${noteData.noteTitle}', this)">
                                        <button class='${noteData.isSaved ? "save-note-btn saved" : "save-note-btn" }' id="save-note-btn" data-issaved="${noteData.isSaved}">
                                            <i class="fa-regular fa-bookmark"></i>
                                            <i class="fa-solid fa-bookmark saved"></i>
                                        </button>
                                        <span class="opt-label">Save Note</span>
                                    </div>

                                    <div class="option" onclick="download('${noteData.noteID}', '${noteData.noteTitle}')">
                                        <svg class="download-icon" width="40" height="40" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg" >
                                            <path d="M37.1541 26.5395V33.6165C37.1541 34.555 36.7813 35.455 36.1177 36.1186C35.4541 36.7822 34.5541 37.155 33.6156 37.155H8.84623C7.90776 37.155 7.00773 36.7822 6.34414 36.1186C5.68054 35.455 5.30774 34.555 5.30774 33.6165V26.5395M12.3847 17.6933L21.2309 26.5395M21.2309 26.5395L30.0771 17.6933M21.2309 26.5395V5.30859" stroke="#1E1E1E" stroke-width="2.29523" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                        <span class="opt-label">Download</span>
                                    </div>
                                    <div class="option" onclick="setupShareModal('${noteData.noteID}')"
                                        >
                                        <svg class="share-icon" width="40" height="40" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" >
                                      <path d="M30.6079 32.5223L27.8819 29.8441L36.6816 21.0444L27.8819 12.2446L30.6079 9.56641L42.0858 21.0444L30.6079 32.5223ZM3.82599 36.3483V28.6963C3.82599 26.05 4.7506 23.8023 6.59983 21.953C8.48094 20.0719 10.7446 19.1314 13.391 19.1314H25.2037L18.3169 12.2446L21.0429 9.56641L32.5209 21.0444L21.0429 32.5223L18.3169 29.8441L25.2037 22.9574H13.391C11.7968 22.9574 10.4418 23.5153 9.32584 24.6312C8.20993 25.7471 7.65197 27.1022 7.65197 28.6963V36.3483H3.82599Z" fill="#1D1B20"/>
                                  </svg>
                                        <span class="opt-label">Share</span>
                                    </div>
                                </div>
                            </div>
                              </div>
                          <div class="note-details">
                              <div class="author-info">
                                  <img src="${noteData.profile_pic}" class="author-img">
                                  <div class="author-title-container">
                                      <div class="note-title"><a href="/view/${noteData.noteID}" onclick='location.reload()'>${truncatedTitle(noteData.noteTitle)}</a></div>
                                      <div class="author"><a class="author-prfl-link" href="/user/${noteData.ownerUserName}">${noteData.ownerDisplayName}</a></div>
                                  </div>
                              </div>
                              <div class="note-engagement">
                            <div class="vote-container">
                                <div class="uv-container" id="upvote-container" data-isupvoted='${noteData.isUpvoted}' data-noteid='${noteData.noteID}' onclick="upvote(this)">
                                    <svg class="uv-icon" width="18" height="19" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        ${noteData.isUpvoted ?
                                            `<path d="M20.293 10.2935L19.5859 11.0006L20.293 10.2935ZM10.2929 1.70717L9.58575 1.00008L10.2929 1.70717ZM9.58575 1.00008L0.999862 9.58646L2.41412 11.0006L11 2.41425L9.58575 1.00008ZM2.41412 13.0006H6V11.0006H2.41412V13.0006ZM6 13.0006V19.5H8V13.0006H6ZM9.5 23H12.5V21H9.5V23ZM16 19.5V13.0006H14V19.5H16ZM16 13.0006H19.5859V11.0006H16V13.0006ZM21.0001 9.58646L12.4143 1.00008L11 2.41425L19.5859 11.0006L21.0001 9.58646ZM19.5859 13.0006C21.3677 13.0006 22.26 10.8464 21.0001 9.58646L19.5859 11.0006L19.5859 11.0006V13.0006ZM16 13.0006L16 13.0006V11.0006C14.8954 11.0006 14 11.8961 14 13.0006H16ZM12.5 23C14.433 23 16 21.433 16 19.5H14C14 20.3284 13.3284 21 12.5 21V23ZM6 19.5C6 21.433 7.567 23 9.5 23V21C8.67157 21 8 20.3284 8 19.5H6ZM6 13.0006L6 13.0006H8C8 11.8961 7.10457 11.0006 6 11.0006V13.0006ZM0.999862 9.58646C-0.260013 10.8464 0.632334 13.0006 2.41412 13.0006V11.0006L2.41412 11.0006L0.999862 9.58646ZM11 2.41425L11 2.41425L12.4143 1.00008C11.6332 0.218978 10.3668 0.218978 9.58575 1.00008L11 2.41425ZM11 1L21 11H14V21H8V11H1L11 1Z" fill="#00FF00" />`
                                            : `<path d="M20.293 10.2935L19.5859 11.0006L20.293 10.2935ZM10.2929 1.70717L9.58575 1.00008L10.2929 1.70717ZM9.58575 1.00008L0.999862 9.58646L2.41412 11.0006L11 2.41425L9.58575 1.00008ZM2.41412 13.0006H6V11.0006H2.41412V13.0006ZM6 13.0006V19.5H8V13.0006H6ZM9.5 23H12.5V21H9.5V23ZM16 19.5V13.0006H14V19.5H16ZM16 13.0006H19.5859V11.0006H16V13.0006ZM21.0001 9.58646L12.4143 1.00008L11 2.41425L19.5859 11.0006L21.0001 9.58646ZM19.5859 13.0006C21.3677 13.0006 22.26 10.8464 21.0001 9.58646L19.5859 11.0006L19.5859 11.0006V13.0006ZM16 13.0006L16 13.0006V11.0006C14.8954 11.0006 14 11.8961 14 13.0006H16ZM12.5 23C14.433 23 16 21.433 16 19.5H14C14 20.3284 13.3284 21 12.5 21V23ZM6 19.5C6 21.433 7.567 23 9.5 23V21C8.67157 21 8 20.3284 8 19.5H6ZM6 13.0006L6 13.0006H8C8 11.8961 7.10457 11.0006 6 11.0006V13.0006ZM0.999862 9.58646C-0.260013 10.8464 0.632334 13.0006 2.41412 13.0006V11.0006L2.41412 11.0006L0.999862 9.58646ZM11 2.41425L11 2.41425L12.4143 1.00008C11.6332 0.218978 10.3668 0.218978 9.58575 1.00008L11 2.41425Z" fill="black" />`
                                        }
                                    </svg>									
                                    <span class="uv-count">${noteData.upvoteCount}</span>
                                </div>
                                <div class="divider-uv-dv"></div>
                                <div class="dv-container">
                                <svg class="dv-icon" width="18" height="19" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.72696 13.8523L2.42297 13.1343L1.72696 13.8523ZM11.8598 22.2816L12.5779 22.9776L11.8598 22.2816ZM12.5779 22.9776L21.0288 14.2583L19.5926 12.8664L11.1418 21.5856L12.5779 22.9776ZM19.5614 10.8666L15.976 10.9226L16.0072 12.9223L19.5926 12.8664L19.5614 10.8666ZM15.976 10.9226L15.8746 4.42398L13.8748 4.45518L13.9762 10.9538L15.976 10.9226ZM12.3204 0.979002L9.3208 1.0258L9.352 3.02556L12.3516 2.97876L12.3204 0.979002ZM5.87582 4.57998L5.97721 11.0786L7.97697 11.0474L7.87558 4.54878L5.87582 4.57998ZM5.97721 11.0786L2.39177 11.1345L2.42297 13.1343L6.00841 13.0783L5.97721 11.0786ZM1.03095 14.5703L9.74973 23.0217L11.1418 21.5856L2.42297 13.1343L1.03095 14.5703ZM2.39177 11.1345C0.6102 11.1623 -0.24843 13.3302 1.03095 14.5703L2.42297 13.1343L2.42297 13.1343L2.39177 11.1345ZM5.97721 11.0786L5.97721 11.0786L6.00841 13.0783C7.11285 13.0611 7.9942 12.1518 7.97697 11.0474L5.97721 11.0786ZM9.3208 1.0258C7.38804 1.05596 5.84567 2.64721 5.87582 4.57998L7.87558 4.54878C7.86266 3.72045 8.52367 3.03848 9.352 3.02556L9.3208 1.0258ZM15.8746 4.42398C15.8445 2.49122 14.2532 0.948848 12.3204 0.979002L12.3516 2.97876C13.18 2.96584 13.8619 3.62685 13.8748 4.45518L15.8746 4.42398ZM15.976 10.9226L15.976 10.9226L13.9762 10.9538C13.9935 12.0582 14.9028 12.9395 16.0072 12.9223L15.976 10.9226ZM21.0288 14.2583C22.2689 12.9789 21.343 10.8388 19.5614 10.8666L19.5926 12.8664L19.5926 12.8664L21.0288 14.2583ZM11.1418 21.5856L11.1418 21.5856L9.74973 23.0217C10.5429 23.7905 11.8091 23.7708 12.5779 22.9776L11.1418 21.5856Z" fill="black"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="cmnt-engagement" onclick="window.location.href='/view/${noteData.noteID}/#feedbacks'">
                                <svg
                                onclick="window.location.href='/view/${noteData.noteID}/#feedbacks'"
                                class="comment-icon"
                                width="20"
                                height="20"
                                viewBox="0 0 36 37"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                            <path
                                d="M34.4051 23.9151C34.4051 24.8838 34.0257 25.8128 33.3505 26.4978C32.6753 27.1828 31.7595 27.5676 30.8045 27.5676H9.20113L2 34.8726V5.65252C2 4.68381 2.37934 3.75478 3.05458 3.0698C3.72982 2.38482 4.64564 2 5.60057 2H30.8045C31.7595 2 32.6753 2.38482 33.3505 3.0698C34.0257 3.75478 34.4051 4.68381 34.4051 5.65252V23.9151Z"
                                stroke="#1E1E1E"
                                stroke-width="2.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                                    </svg>
                                <span class="cmnt-count">${noteData.feedbackCount}</span>
                            </div>
                            
                        </div>           
                          </div>
                      </div> `;

            document.querySelector('.feed-container').insertAdjacentHTML('beforeend', noteCardsHtml); // 1

            let newNoteCard = document.querySelector('.feed-note-card:last-child')
            observers.observer().observe(newNoteCard) // 2
            document.querySelector('.fetch-loading').style.display = 'flex'
        }
    },

    /**
     * @param {Object} noteData - { noteID, noteTitle }
     * @description First checks if there is already a saved note div with that noteID (saved-note-noteID). If not then adds one
     */
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

    /**
     * @param {Object} feedbackData - { notiID, feedbackID, isread, noteID, nfnTitle, commenterUserName, commenterDisplayName }
     * @description - First checks if there is already a noti div with noti-notiID, if not, adds one
    */
    addNoti: function (feedbackData) {
        let notificationContainer = document.querySelector('.notifications-container')
        let existingNoti = document.querySelector(`#noti-${feedbackData.notiID}`)

        if (!existingNoti) {
            let isVote = feedbackData.vote ? true : false
            let notificationHtml = `
                  <div class="notification secondary-${feedbackData.isread}" id="noti-${feedbackData.notiID}">
                      ${!isVote ? `<span class='feedback-id' style='display: none;'>${feedbackData.feedbackID}</span>` : ""} 
                      <div class="first-row">
                      <div class="frnt-wrapper">
                      <span class="isRead ${feedbackData.isread}"></span>
                        <a href='/view/${feedbackData.noteID}/${!isVote ? `#${feedbackData.feedbackID}` : ''}' class="notification-link">
                          <span class="notification-title">
                          ${truncatedTitle(feedbackData.nfnTitle)}
                          </span>
                        </a>
                        </div>   
                        <span class="remove-notification" onclick="deleteNoti('${feedbackData.notiID}')">&times;</span>
                      </div>
                      <div class="notification-msg">
                        ${!isVote ? `
                            <a href='/view/${feedbackData.noteID}/#${feedbackData.feedbackID}' class="notification-link-2">${feedbackData.message}</a>` : 
                            `<a href='/view/${feedbackData.noteID}' class="notification-link-2">${feedbackData.message}</a>`
                		} 
                      </div>
                  </div>`
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
                //<path d="M107.498 49.9985C107.998 49.9985 109.994 52.6188 109.494 70.581C108.994 88.5431 93.5 110.998 88.993 110.998C84.4861 110.998 28.4996 112 28.493 110.455C28.4863 108.91 28.4938 47.5373 28.4938 47.5373L49.9956 32.4996C49.9956 32.4996 53.0332 25.5652 57.9956 8.99958C62.958 -7.56607 78.4744 33.916 66 49.9982M107.498 49.9985C106.998 49.9985 66 49.9982 66 49.9982M107.498 49.9985L66 49.9982" stroke="#606770" stroke-width="10" stroke-linecap="round"/>
                //
        let date = new Date(feedbackData.createdAt)
        const formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Dhaka',
            hour12: true
        });
        const formattedDate = formatter.format(date);
        let feedbackCard = `
        <div class='main-cmnt-container'>
            <div class="main__author-threadline-wrapper">
                <img
                    src="${feedbackData.commenterDocID.profile_pic}"
                    alt="User Avatar"
                    class="main__cmnt-author-img cmnt-author-img"
                />
                <div class="thread-line"></div>
             </div>
            <div class="main__cmnts-replies-wrapper">
                <div class="main__body cmnt-body-3rows">
                    <div class="main__reply-info reply-info">
                        <span id="parentFeedbackDocID" style="display: none;">${feedbackData._id}</span>
                        <span id="commenterUsername" style="display: none;">${feedbackData.commenterDocID.username}</span>
                        <span class="main__author-name">${feedbackData.commenterDocID.displayname}</span>
                        <span class="reply-date">${formattedDate}</span>
                    </div>
                    <div class="main__reply-msg reply-msg">${feedbackData.feedbackContents}</div>
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
                </div>

                <div class="thread-section" id="thread-${feedbackData._id}"></div>
            </div>
        </div>
      `;
        document.querySelector(".cmnts-list").insertAdjacentHTML('afterbegin', feedbackCard)
    },


    addReply: function (threadSection, replyData) {
        console.log(threadSection)
        let date = new Date(replyData.createdAt)
        const formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Dhaka',
            hour12: true
        });
        const formattedDate = formatter.format(date);
        replyMessage = `
        <div class='thread-msg'>
            <img src="${replyData.commenterDocID.profile_pic}" alt="User Avatar" class="cmnt-author-img thread-avatar">
            <div class="cmnt-body-3rows">
                <div class="reply-info">
                    <span id="commenterUsername" style="display: none;">${replyData.commenterDocID.username}</span>
                    <span class="main__author-name">${replyData.commenterDocID.displayname}</span>
                    <span class="reply-date">${formattedDate}</span>
                </div>
                <div class="reply-msg">${replyData.feedbackContents}</div>
                <div class="main__engagement-opts engagement-opts">
                <!--<div class="like-wrapper">
                    <svg class="like-icon" data-tippy-content="Like" width="20" height="22" viewBox="0 0 115 117" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 51V112" stroke="#606770" stroke-width="10" stroke-linecap="round"/>
                    <path class='like-icon-fill' d="M28.4938 47.5373C28.4938 47.5373 28.4863 108.91 28.493 110.455C28.4996 112 84.4861 110.998 88.993 110.998C93.5 110.998 108.994 88.5431 109.494 70.581C109.994 52.6188 107.998 49.9985 107.498 49.9985L66 49.9982C78.4744 33.916 62.958 -7.56607 57.9956 8.99958C53.0332 25.5652 49.9956 32.4996 49.9956 32.4996L28.4938 47.5373Z" fill="white"/>
                    <path d="M107.498 49.9985C107.998 49.9985 109.994 52.6188 109.494 70.581C108.994 88.5431 93.5 110.998 88.993 110.998C84.4861 110.998 28.4996 112 28.493 110.455C28.4863 108.91 28.4938 47.5373 28.4938 47.5373L49.9956 32.4996C49.9956 32.4996 53.0332 25.5652 57.9956 8.99958C62.958 -7.56607 78.4744 33.916 66 49.9982M107.498 49.9985C106.998 49.9985 66 49.9982 66 49.9982M107.498 49.9985L66 49.9982" stroke="#606770" stroke-width="10" stroke-linecap="round"/>
                    </svg>
                    <span class="like-count">0</span>
                </div>-->
                <svg 
                class="reply-icon thread-opener"
                data-tippy-content="Reply"
                width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" stroke-width="1.14582" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>                    
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
function setupShareModal(noteID) {
    const shareNoteModal = document.querySelector('.share-note-overlay');
    const closeNoteModalBtn = document.querySelector('.close-share-note-modal');

    if (!shareNoteModal || !closeNoteModalBtn || !linkElement) {
        console.error('One or more required elements are not found');
        return;
    }

    // Open the modal and populate the link (immediate execution)
    shareNoteModal.style.display = 'flex';
    linkElement.innerHTML = `${window.location.origin}/view/${noteID}`;
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

//FIXME: replition in dashboard
async function _checkNoSavedMessage() {
	let _savedNotes = await manageDb.get('savedNotes')

	if (_savedNotes.length === 0) {
		document.querySelector('.no-saved-notes-message').style.display = 'inline'
	}
}


/**
* @param {undefined} [saveButtonOptionElement=undefined] 
* @description - for dashboard notes. dashboard will have a lot of notes. this element will be used to take action on the save-button which is clicked
*/
async function saveNote(noteDocID, noteTitle, saveButtonOptionElement=undefined) {
    try {
        let noteData = new FormData()
        noteData.append("noteDocID", noteDocID)

        async function actionAfter(mode, svButton) {
            if (mode === "save") {
                svButton.classList.add('saved')

                let savedNoteObject = { noteID: noteDocID, noteTitle: noteTitle }
                manageNotes.addSaveNote(savedNoteObject)
                manageDb.add('savedNotes', savedNoteObject)

                svButton.setAttribute("data-issaved", "true")
                document.querySelector('.no-saved-notes-message').style.display = 'none'
            } else {
                svButton.classList.remove('saved')
                document.querySelector(`#saved-note-${noteDocID}`).remove()

                svButton.setAttribute("data-issaved", "false")
                await manageDb.delete('savedNotes', noteDocID)
                await _checkNoSavedMessage()
            }
        }

        async function saveUnSaveFetch(svButton) {
            let issaved = svButton.getAttribute("data-issaved")
            async function saveApi(action) {
                let response = await fetch(`/api/note/save?action=${action}`, {
                    method: 'post',
                    body: noteData
                })
                let data = await response.json()
                data[action] ? await actionAfter(action, svButton) : setupErrorPopup("Please try again a bit later!")
            }

            if (issaved === "false") {
                await saveApi("save")
            } else {
                await saveApi("unsave")
            }
        }


        if (!saveButtonOptionElement) {
            let svButton = document.querySelector('#save-note-btn')
            saveUnSaveFetch(svButton)
        } 
        
        else {
            let svButton = saveButtonOptionElement.querySelector('#save-note-btn')
            saveUnSaveFetch(svButton)
        }
    } catch (error) {
        setupErrorPopup(error)
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
    //* Mobile notification panel
    const notificationPanel = document.querySelector('.notification-panel');
    const notificationButton = document.querySelector('.mobile-nft-btn');
    const backgroundOverlay = document.querySelector('.background-overlay');
    const hideNotificationPanel = document.querySelector('.btn-hide-nft');

    notificationButton.addEventListener('click', () => {
        notificationPanel.classList.toggle('show');
        backgroundOverlay.classList.toggle('show-overlay');
    });
    backgroundOverlay.addEventListener('click', () => {
        notificationPanel.classList.remove('show');
        backgroundOverlay.classList.remove('show-overlay');
    });
    hideNotificationPanel.addEventListener('click', () => {
        notificationPanel.classList.remove('show');
        backgroundOverlay.classList.remove('show-overlay');
    })
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

