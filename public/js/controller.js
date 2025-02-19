const conHost = window.location.origin
const conSock = io(conHost)

//* Badge images: user-profile + search-profile
let baseURL = 'https://storage.googleapis.com/noteroom-fb1a7.appspot.com/badges/'
let imageObject = {
    'No Badge': `${baseURL}no-badge.png`,
    'Biology': `${baseURL}biology.png`,
    'English': `${baseURL}english.png`
}


function FeedNote(note) {
    this.isQuickPost = note.postType === "quick-post",
    this.noteData = {
        noteID: note._id,
        noteTitle: !this.isQuickPost ? note.title : null,
        description: note.description,
        createdAt: note.createdAt,
    },
    this.contentData = {
        content1: this.isQuickPost || note.content.length > 1 ? note.content[0] : null ,
        content2: !this.isQuickPost ? note.content[1] : null,
        contentCount: note.content.length,
    },
    this.ownerData = {
        ownerID: note.ownerDocID.studentID,
        profile_pic: note.ownerDocID.profile_pic,
        ownerDisplayName: note.ownerDocID.displayname,
        ownerUserName: note.ownerDocID.username,
        isOwner: note.isOwner,
    },
    this.interactionData = {
        feedbackCount: note.feedbackCount,
        upvoteCount: note.upvoteCount,
        isSaved: note.isSaved,
        isUpvoted: note.isUpvoted,
    },
    this.extras = {
        quickPost: this.isQuickPost,
        pinned: note.pinned
    }
}

function manageRequest(requestCard) {
    const firstRow = requestCard.querySelector(".request__fr");
    const secondRow = requestCard.querySelector(".request__sr");
    const chevronIcon = requestCard.querySelector(".request-chevron-icon");

    let reqID = requestCard.id.split('-')[1]
    let senderUserName = requestCard.getAttribute("data-senderusername")

    const acceptButton = requestCard.querySelector(".btn-accept-request");
    const rejectButton = requestCard.querySelector(".btn-reject-request")

    secondRow.classList.toggle("request__sr--expanded");
    chevronIcon.classList.toggle("request__fr--chevron-rotated");

    acceptButton.addEventListener("click", async function () {
        let notes = await manageDb.get('ownedNotes')
        let noteObjects = {}
        notes.forEach(note => {
            noteObjects[note.noteID] = note.noteTitle
        })

        let { value } = await Swal.fire({
            title: "Select a post to bind the request",
            input: "select",
            inputOptions: {
                Notes: noteObjects
            },
            inputPlaceholder: "Select a post",
            showCancelButton: true,
        })
        if (value) {
            let noteDocID = value

            let requestData = new FormData()
            requestData.append('senderUserName', senderUserName)
            requestData.append('reqID', reqID)
            requestData.append('noteDocID', noteDocID)

            let response = await fetch('/api/request/done', {
                method: 'post',
                body: requestData
            })
            let data = await response.json()
            if (data.ok) {
                requestCard.remove()
                manageDb.delete('requests', { idPath: 'recID', id: reqID })
                Swal.fire(toastData('success', "You've the completed the request. Kudos!"))
            } else {
                Swal.fire(toastData('error', 'Failed to mark request as done. Please try again later.', 3000))
            }
        }
    })

    rejectButton.addEventListener("click", async function () {
        let result = await Swal.fire({
            icon: "question",
            title: "Are you sure you want to reject the request?",
            text: "You can send a small message to the sender for clarification (optional)",
            input: "text",
            inputPlaceholder: "Message",
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Reject'
        })

        if (result.isConfirmed) {
            let message = result.value
            let requestData = new FormData()
            requestData.append("reqID", reqID)
            requestData.append('message', message)
            requestData.append('senderUserName', senderUserName)

            let response = await fetch('/api/request/reject', {
                method: 'post',
                body: requestData
            })
            let data = await response.json()
            if (data.ok) {
                requestCard.remove()
                manageDb.delete('requests', { idPath: 'recID', id: reqID })
                Swal.fire(toastData("success", "Requested has been rejected"))
            } else {
                Swal.fire(toastData("error", "Failed to reject the request. Please try again later.", 3000))
            }
        }
    })
}


function getCollegeFromID(collegeID) {
    if (!Number.isNaN(parseInt(collegeID))) {
        let collegeDistrict = Object.keys(districtCollegeData)[parseInt(collegeID / 100) - 1]
        let collegeObject = districtCollegeData[collegeDistrict].filter(data => data.id == parseInt(collegeID))[0]
        return collegeObject
    } else {
        return { name: collegeID, logo: 'college-placeholder.png' }
    }
}

let savedNoteObserver = new MutationObserver(entries => {
    let entry = entries[0]
    if (entry.addedNodes.length > 0) {
        document.querySelector('.no-saved-notes-message').classList.add('hide')
    }
})
savedNoteObserver.observe(document.querySelector('.saved-notes-container'), { childList: true })


async function updateFromIndexedDB(store) {
    let objects = await manageDb.get(store)
    objects.forEach(object => {
        if (store === "savedNotes") {
            manageNotes.addSaveNote(object);
        } else if (store === "notifications") {
            manageNotes.addNoti(object);
        } else if (store === "requests") {
            manageNotes.addRequest(object)
        }
    })
}

async function readNoti(noti) {
    let isread = noti.getAttribute('data-isread')
    let redirectTo = noti.getAttribute('data-redirectTo')
    let notiType = noti.getAttribute('data-notitype')

    if (isread === "false") {
        let notiID = noti.getAttribute('data-notiid')

        noti.querySelector('p.noti-msg').classList.replace('secondary-false', 'secondary-true')
        noti.querySelector('.noti__sc--second-row-noti-info span').classList.replace('false', 'true')
        noti.querySelector('.noti__sc--second-row-noti-info span:last-child').classList.replace('secondary-false', 'secondary-true')

        let notification = await db['notifications'].where('notiID').equals(notiID).first()
        notification["isRead"] = true
        await db["notifications"].put(notification)

        conSock.emit('read-noti', notiID)

        if (notiType === 'notification-request') {
            console.log(`yah`)
            await updateFromIndexedDB('requests')
        }
    }
    

    if (redirectTo && redirectTo !== "") {
        window.location.href = redirectTo
    } 
}

document.querySelector(".delete-all-noti-icon").addEventListener('click', async (event) => {
    try {
        let container = document.querySelector('.notifications-container')
        if(container.childElementCount !== 0) {
            Swal.fire(toastData('success', 'All notifications will be deleted', 3000))
            container.querySelectorAll('.notification').forEach(noti => noti.remove())

            let response = await fetch('/api/notifications/delete', { method: 'delete' })
            let data = await response.json()
            if (data.ok) {
                await db["notifications"].clear()
            }
        }    
    } catch (error) {}
})

async function rerunRequestFunction() {
    await updateFromIndexedDB("notifications")
    await updateFromIndexedDB("savedNotes")
    await updateFromIndexedDB("requests")
}

const dashboardJSScriptLoader = document.querySelector('#is-script-loaded')
let dashboardScriptLoadObserver = new MutationObserver(async entries => {
    if (entries[0]) {
        await rerunRequestFunction()
    }
    dashboardScriptLoadObserver.disconnect()
})
if (dashboardJSScriptLoader) {
    dashboardScriptLoadObserver.observe(dashboardJSScriptLoader, { attributes: true })
}

window.addEventListener('load', async () => {
    if (window.location.pathname !== "/dashboard") {
        await rerunRequestFunction()
    }
})


let toastData = (type, message, timer = 2000) => {
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
const dbVersion = 18

db.version(dbVersion).stores({
    savedNotes: "++id,noteID,noteTitle,noteThumbnail,ownerDisplayName,ownerUserName",
    ownedNotes: "++id,noteID,noteTitle,noteThumbnail,ownerDisplayName,ownerUserName",
    notifications: "++id,notiID,content,fromUserSudentDocID,redirectTo,isRead,createdAt,notiType",
    requests: "++id,recID,message,createdAt,senderDisplayName,senderUserName",
    feedNotes: "++id,noteID,noteData,contentData,ownerData,interactionData,extras"
})
db.on('versionchange', async (event) => {
    console.log(`Changed the version to ${dbVersion}`)
    try {
        if (event.oldVersion < dbVersion) {
            await db.delete()
            await db.open()
        }
    } catch (error) { 
        console.log(`Error: ${error}`)
    }
})
db.open().then(() => {
    console.log(`indexedDB is initialized`)
}).catch((error) => {
    console.log(`Cannot initialize indexedDB: ${error}`)
})

const manageDb = {
    async add(store, obj) {
        if (store === "savedNotes" || store === "ownedNotes") {
            let existingNote = await db[store].where("noteID").equals(obj._id).first()
            if (!existingNote) {
                await db[store].add({
                    noteID: obj._id,
                    noteTitle: obj.title,
                    noteThumbnail: obj.thumbnail,
                    ownerDisplayName: obj.ownerDocID.displayname,
                    ownerUserName: obj.ownerDocID.username
                })
            }
        } else if (store === "requests") {
            let existingRec = await db[store].where("recID").equals(obj._id).first()
            if (!existingRec) {
                await db[store].add({
                    recID: obj._id,
                    message: obj.message,
                    createdAt: obj.createdAt,
                    senderDisplayName: obj.senderDocID.displayname,
                    senderUserName: obj.senderDocID.username
                })
            }
        } else if (store === "notifications") {
            let existingNoti = await db[store].where("notiID").equals(obj._id).first()
            if (!existingNoti) {
                await db[store].add({
                    notiID: obj._id,
                    content: obj.content,
                    fromUserSudentDocID: obj.fromUserSudentDocID,
                    redirectTo: obj.redirectTo,
                    isRead: obj.isRead,
                    createdAt: obj.createdAt,
                    notiType: obj.notiType
                })
            } else {
                existingNoti = Object.assign(existingNoti, obj)
                await db[store].put(existingNoti)
            }
        } else if (store === "feedNotes") {
            let existingNote = await db[store].where("noteID").equals(obj.noteData.noteID).first()
            if (!existingNote) {
                await db[store].add(obj)
            }
        }
    },

    async get(store) {
        let allObjects = await db[store].toArray()
        return allObjects
    },

    async delete(store, { idPath, id }) {
        let note = await db[store].where(idPath).equals(id).first()
        await db[store].delete(note.id)
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
        voteContainer.removeAttribute('data-disabled')
    }
}

const isAdmin = document.querySelector('span#admin') ? true : false
//* The main dynamic content loading manager object
const manageNotes = {
    formatDate: function (dateString) {
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

    addNote: function ({ noteData, contentData, ownerData, interactionData, extras }) {
        let existingUNote = document.querySelector(`#note-${noteData.noteID}`)
        let feedContainer = document.querySelector('.feed-container')

        //FIXME: there should be a skeleton loader for the note card or for the note image
        if (!existingUNote) {
            let noteCardHtml = `
                <div class="feed-note-card" id="note-${noteData.noteID}" data-posttype="${extras.quickPost ? 'quick-post' : 'note'}">
                    <div class="fnc__first-row">
                        <div class="fnc__fr-author-img-wrapper">
                            <img src="${ownerData.profile_pic}" class="fnc__fr-author-img" onclick="window.location.href='/user/${ownerData.ownerUserName}'"/>
                        </div>
                        <div class="fnc__fr-note-info-wrapper">
                            <div class="note-info-wrapper--first-row">
                                <div class="niw--fr-first-col">
                                <div class="niw--fr-first-col-fr">
                                <a class="author-prfl-link" href="/user/${ownerData.ownerUserName}">${ownerData.ownerDisplayName}</a>
                                ${!ownerData.isOwner ? `
                                        <span class="niw--fr-first-col-fr-seperator"></span>
                                        <span 
                                            class="db-note-card-request-option" 
                                            data-req-pfp="${ownerData.profile_pic}" 
                                            data-req-dn="${ownerData.ownerDisplayName}" 
                                            data-req-un="${ownerData.ownerUserName}"
                                        >Request</span>
                                ` : ``}
                                <div class="pinned-wrapper">
                                    ${extras.pinned ? `
                                        <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM14.1096 8.41878L15.592 9.90258C16.598 10.9095 17.1009 11.413 16.9836 11.9557C16.8662 12.4985 16.2003 12.7487 14.8684 13.2491L13.9463 13.5955C13.5896 13.7295 13.4113 13.7965 13.2736 13.9157C13.2134 13.9679 13.1594 14.027 13.1129 14.0918C13.0068 14.2397 12.9562 14.4236 12.855 14.7913C12.6249 15.6276 12.5099 16.0457 12.2359 16.202C12.1205 16.2679 11.9898 16.3025 11.8569 16.3023C11.5416 16.3018 11.2352 15.9951 10.6225 15.3818L10.1497 14.9086L8.531 16.5299C8.23835 16.823 7.76348 16.8234 7.47034 16.5308C7.17721 16.2381 7.17683 15.7632 7.46948 15.4701L9.08892 13.848C9.08871 13.8482 9.08914 13.8478 9.08892 13.848L8.64262 13.4C8.03373 12.7905 7.72929 12.4858 7.72731 12.1723C7.72645 12.0368 7.76164 11.9035 7.82926 11.786C7.98568 11.5145 8.40079 11.4 9.23097 11.1711C9.5993 11.0696 9.78346 11.0188 9.9315 10.9123C9.99792 10.8644 10.0583 10.8088 10.1114 10.7465C10.2298 10.6076 10.2956 10.4281 10.4271 10.069L10.7611 9.15753C11.2545 7.81078 11.5013 7.1374 12.0455 7.01734C12.5896 6.89728 13.0963 7.40445 14.1096 8.41878Z" fill="#1C274C"/>
                                        </svg>
                                    ` : ``}
                                </div>
                                </div>
                            <span class="niw--fr-first-col-note-pub-date">${(new Date(noteData.createdAt)).toDateString()}</span>
                            </div>

                            <div class="niw--fr-second-col">
                                <div class="note-menu">
                                    <button class="note-menu-btn">
                                        <svg width="25" height="105" class="note-menu-eclipse-icon" viewBox="0 0 25 105" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="25" height="25" rx="12.5" fill="black"/>
                                            <rect y="40" width="25" height="25" rx="12.5" fill="black"/>
                                            <rect y="80" width="25" height="25" rx="12.5" fill="black"/>
                                        </svg>
                                    </button>
                                    <div class="menu-options">   
                                        ${!extras.quickPost ? `
                                            <div class="option svn-btn-parent" id="save-btn-${noteData.noteID}" onclick="saveNote(this, true)" data-notetitle="${noteData.noteTitle}" data-noteid="${noteData.noteID}" data-issaved="${interactionData.isSaved}">
                                                <button class="${interactionData.isSaved ? "saved" : ""} save-note-btn" id="save-note-btn">
                                                    <svg class="bookmark-fill-white" width="28" height="40" viewBox="0 0 66 97" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M0.619048 96C0.619048 96.1528 0.710359 96.2908 0.850996 96.3506C0.991633 96.4104 1.15437 96.3803 1.26439 96.2743L32.2955 66.3606C32.7036 65.9672 33.2964 65.9672 33.7045 66.3606L64.7356 96.2743C64.8456 96.3803 65.0084 96.4104 65.149 96.3506C65.2896 96.2908 65.381 96.1528 65.381 96V4.27586C65.381 2.2943 63.924 0.619048 62.0462 0.619048H3.95385C2.07596 0.619048 0.619048 2.2943 0.619048 4.27586V96ZM3.95385 3.56486H62.0462C62.3434 3.56486 62.6498 3.84515 62.6498 4.27586V90.3117L35.5252 64.1638C34.0811 62.7717 31.9189 62.7717 30.4748 64.1638L3.35018 90.3117V4.27586C3.35018 3.84515 3.65658 3.56486 3.95385 3.56486Z" fill="black" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
                                                    </svg>
                                                    <svg class="bookmark-fill-black" width="28" height="40" viewBox="0 0 66 97" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M0 3C0 1.34314 1.34315 0 3 0H63C64.6569 0 66 1.34315 66 3V93.9494C66 96.5944 62.8256 97.9451 60.9198 96.111L35.0802 71.2442C33.9187 70.1264 32.0813 70.1264 30.9198 71.2442L5.08024 96.111C3.17437 97.9451 0 96.5944 0 93.9494V3Z" fill="black"/>
                                                    </svg>
                                                </button>
                                                <span class="opt-label">Save Note</span>
                                            </div>


                                            <div class="option" onclick="download('${noteData.noteID}', '${noteData.noteTitle}')">
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
                                        ` : ``} 

                                        <div class="option" onclick="setupShareModal(this, '${extras.quickPost}')" data-noteid="${noteData.noteID}" data-notetitle="${noteData.noteTitle}">
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
                                        ${isAdmin ? `
                                            <div class="option" onclick="pinUnpinPost(this)" data-noteid="${noteData.noteID}" data-ispinned="${extras.pinned}">
                                                <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM14.1096 8.41878L15.592 9.90258C16.598 10.9095 17.1009 11.413 16.9836 11.9557C16.8662 12.4985 16.2003 12.7487 14.8684 13.2491L13.9463 13.5955C13.5896 13.7295 13.4113 13.7965 13.2736 13.9157C13.2134 13.9679 13.1594 14.027 13.1129 14.0918C13.0068 14.2397 12.9562 14.4236 12.855 14.7913C12.6249 15.6276 12.5099 16.0457 12.2359 16.202C12.1205 16.2679 11.9898 16.3025 11.8569 16.3023C11.5416 16.3018 11.2352 15.9951 10.6225 15.3818L10.1497 14.9086L8.531 16.5299C8.23835 16.823 7.76348 16.8234 7.47034 16.5308C7.17721 16.2381 7.17683 15.7632 7.46948 15.4701L9.08892 13.848C9.08871 13.8482 9.08914 13.8478 9.08892 13.848L8.64262 13.4C8.03373 12.7905 7.72929 12.4858 7.72731 12.1723C7.72645 12.0368 7.76164 11.9035 7.82926 11.786C7.98568 11.5145 8.40079 11.4 9.23097 11.1711C9.5993 11.0696 9.78346 11.0188 9.9315 10.9123C9.99792 10.8644 10.0583 10.8088 10.1114 10.7465C10.2298 10.6076 10.2956 10.4281 10.4271 10.069L10.7611 9.15753C11.2545 7.81078 11.5013 7.1374 12.0455 7.01734C12.5896 6.89728 13.0963 7.40445 14.1096 8.41878Z" fill="#1C274C"/>
                                                </svg>
                                                <span class="opt-label">Pin/Unpin Post</span>
                                            </div>
                                        ` : ``}
                                    </div>
                                </div>
                            </div>
                        </div>

                        
                        <div class="note-info-wrapper--second-row">
                            <p class="fnc--note-desc">
                                ${
                                    (function() {
                                        let description = (new DOMParser()).parseFromString(noteData.description, 'text/html').querySelector('body').textContent.trim()
                                        let charLimit = extras.quickPost ? 250 : 100;
                                        return description.length > charLimit ? `
                                            ${description.slice(0, charLimit)}...
                                            <span class="note-desc-see-more-btn" onclick="window.location.href='/view/${extras.quickPost ? `quick-post/${noteData.noteID}` : noteData.noteID}'">Read More</span>
                                        ` : description;
                                    })()
                                }
                            </p>
                        </div>
                        </div>
                    </div>


                    <div class="fnc__second-row">
                        ${extras.quickPost ?
                            `${contentData.contentCount !== 0 ?
                                `<div class="quickpost-thumbnail-wrapper">
                                    <img onclick="window.location.href='/view/quick-post/${noteData.noteID}'" class="quickpost-thumbnail" src="" data-src="${contentData.content1}"/>
                                </div>`: ``} `
                            :
                            `<div class="thumbnail-grid">
                                <img class="thumbnail primary-img" src="" onclick="window.location.href='/view/${noteData.noteID}'" data-src='${contentData.content1}'/>
                                <div class="thumbnail-secondary-wrapper">
                                    <img class="thumbnail secondary-img" src="" onclick="window.location.href='/view/${noteData.noteID}'" data-src='${contentData.content2}'/>
                                    ${contentData.contentCount > 2 ?
                                        `<div class="thumbnail-overlay" onclick="window.location.href='/view/${noteData.noteID}'">+${parseInt(contentData.contentCount) - 2}</div>` : ''
                                    }
                                </div>
                            </div>`
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
                                    <span class="love-react-metric-count metric-count-font uv-count">${interactionData.upvoteCount}</span>
                                </div>

                                <div class="review-metric-wrapper">
                                    <span
                                        class="review-count metric-count-font cmnt-count"
                                        onclick="window.location.href='/view/${extras.quickPost ? `quick-post/${noteData.noteID}` : `${noteData.noteID}`}/#feedbacks'"
                                    >
                                        ${interactionData.feedbackCount === 0 ? `No reviews yet` : `${interactionData.feedbackCount} Review${interactionData.feedbackCount === 1 ? "" : "s"}`}
                                    </span>
                                </div>
                                </div>

                                <!-- First Row of Third FNC row -->
                                <div class="note-engagement">
                                <div
                                    class="uv-container"
                                    id="upvote-container"
                                    data-isupvoted="${interactionData.isUpvoted}"
                                    data-noteid="${noteData.noteID}"
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
                                    ${interactionData.isUpvoted ?
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
                                    onclick="window.location.href='/view/${extras.quickPost ? `quick-post/${noteData.noteID}` : noteData.noteID}/#feedbacks'"
                                >
                                    <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    onclick="window.location.href='/view/${extras.quickPost ? `quick-post/${noteData.noteID}` : noteData.noteID}/#feedbacks'"
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

            let newNoteCard = document.querySelector(`#note-${noteData.noteID}`)
            observers.observer().observe(newNoteCard)
        }
    },
    addSaveNote: function (noteData) {
        let savedNotesContainer = document.querySelector(".saved-notes-container");
        let existingNote = document.querySelector(`#saved-note-${noteData.noteID}`)

        if (!existingNote) {
            let savedNotesHtml = `
                <div class="saved-note hide" id="saved-note-${noteData.noteID}" onclick="window.location.href='/view/${noteData.noteID}'" >
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

    removeSaveNote: function (noteData) {
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
                <div class="notification" id="noti-${notiData.notiID}" onclick='readNoti(this.querySelector(".noti__sec-col--msg-wrapper"))'>
                    <div class="noti__first-col--img-wrapper">
                    ${isInteraction ? `
                        <img src="${notiData.fromUserSudentDocID.profile_pic}" alt="notification" class="noti__source-user-img">
                        ` : `
                        <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M34.7333 8.18296C33.8821 7.3313 32.8714 6.6557 31.7589 6.19476C30.6465 5.73383 29.4541 5.49658 28.25 5.49658C27.0459 5.49658 25.8535 5.73383 24.7411 6.19476C23.6286 6.6557 22.6179 7.3313 21.7667 8.18296L20 9.94963L18.2333 8.18296C16.5138 6.46347 14.1817 5.49747 11.75 5.49747C9.31827 5.49747 6.98615 6.46347 5.26666 8.18296C3.54717 9.90245 2.58118 12.2346 2.58118 14.6663C2.58118 17.098 3.54717 19.4301 5.26666 21.1496L20 35.883L34.7333 21.1496C35.585 20.2984 36.2606 19.2876 36.7215 18.1752C37.1825 17.0628 37.4197 15.8704 37.4197 14.6663C37.4197 13.4621 37.1825 12.2698 36.7215 11.1574C36.2606 10.0449 35.585 9.03422 34.7333 8.18296Z" fill="url(#paint0_linear_4451_1899)"/>
                            <defs>
                            <linearGradient id="paint0_linear_4451_1899" x1="-60.478" y1="-14.7157" x2="19.9995" y2="52.3183" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#04DBF7"/>
                            <stop offset="1" stop-color="#FF0000"/>
                            </linearGradient>
                            </defs>
                        </svg>
                        `
                    }
                    </div>

                    <div class="noti__sec-col--msg-wrapper" data-redirectTo='${notiData.redirectTo}' data-notiID='${notiData.notiID}' data-isread='${notiData.isRead}' data-notitype="${notiData.notiType}">
                        <div class="noti__sc--first-row-msg">
                            <p class="noti-msg secondary-${notiData.isRead}">
                                ${isInteraction ? `<span class="noti-source-user-name">${notiData.fromUserSudentDocID.displayname}</span>` : ''}
                                ${notiData.content}
                            </p>
                        </div>
                        <div class="noti__sc--second-row-noti-info">
                            <span class="isRead ${notiData.isRead}"></span>
                            <span class="noti-time secondary-${notiData.isRead}">${this.formatDate(notiData.createdAt)}</span>
                        </div>
                    </div>
                </div>`;
            notificationContainer.insertAdjacentHTML('afterbegin', notificationHtml);
        }
    },

    addProfile: function (student, container) {
        const containerClass = {
            random: '.random-prfls',
            mtcCollege: '.mtc-prfls',
            searched: '.results-prfls'
        }

        let profileContainer = document.querySelector(containerClass[container]);
        let existingUser = profileContainer.querySelector(`#user-${student.username}-results-prfls`)
        const randomProfileLoader = document.querySelector('.profile-loader-random')

        /* 
        This is the college name and logo. you can use them directly now, for logo I am just fetching the name of the image. use the full url given below. 

        => Logo Url: `\\images\\onboarding-assets\\College-logos\\${logo}`         * just copy and paste it accordingly, the two-slashes are important here. so don't remove them.

        Problems:
            Some students have a collegeID==null cause they are not onboarded. So I can't get their college name (but their logo is the general placeholder one). 
            If you have a solution for that, do that and ask me anything related to that.

        Development:
            This template below is used for adding mutual college students, random students and searched students (3 kinds). their class and id changes according to that kind. 
            So if you want to add a specific feature to a specific kind of student card, use trinary logics (condition ? true-action : false-action) along with dynamic templates, 
            that will be a bit complex but minimal and less DRY.
        */

        const {name, logo} = getCollegeFromID(student.collegeID)
        console.log([name, logo])
        
        if (!existingUser) {
            let profileCard = `
                <div class="results-prfl" onclick="window.location.href = '/user/${student.username}'" id="user-${student.username}-${container}" data-username="${student.username}"
                >
                    <img src="${student.profile_pic}" alt="Profile Pic" class="prfl-pic">
                    <div class="results-prfl-info">
                        <span class="prfl-name" onclick="window.location.href = '/user/${student.username}'">${student.displayname}</span>
                        <span class="prfl-desc">${truncatedTitle(student.bio)}</span>
                    </div>
                </div>` 
            profileContainer.insertAdjacentHTML('beforeend', profileCard);

            if (container === "random") {
                profileContainer.appendChild(randomProfileLoader)
            }
        }
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
                        onclick="window.location.href='/user/${feedbackData.commenterDocID.username}'"
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

                        <span class="main__author-name" onclick="window.location.href='/user/${feedbackData.commenterDocID.username}'">${feedbackData.commenterDocID.displayname}</span>
                        <span class="reply-date">${this.formatDate(feedbackData.createdAt)}</span>
                    </div>
                    <div class="main__reply-msg reply-msg">${isTemporary ? 'Sending feedback...<div class="search-results-loader"></div>' : feedbackData.feedbackContents}</div>
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
            ${!isTemporary ? `<img src="${replyData.commenterDocID.profile_pic}" alt="User Avatar" class="cmnt-author-img thread-avatar">` : ''}
            <div class="cmnt-body-3rows">
                <div class="reply-info">
                    <span id="commenterUsername" style="display: none;">${replyData.commenterDocID.username}</span>
                    <span class="main__author-name" onclick="window.location.href='/user/${replyData.commenterDocID.username}'">${replyData.commenterDocID.displayname}</span>
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
                    <svg id="threadCmntBtn" class="thread__cmnt-btn" width="18" height="18" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
                    <path d="M231.626,128a16.015,16.015,0,0,1-8.18262,13.96094L54.53027,236.55273a15.87654,15.87654,0,0,1-18.14648-1.74023,15.87132,15.87132,0,0,1-4.74024-17.60156L60.64746,136H136a8,8,0,0,0,0-16H60.64746L31.64355,38.78906A16.00042,16.00042,0,0,1,54.5293,19.44727l168.915,94.59179A16.01613,16.01613,0,0,1,231.626,128Z"/>
                    </svg>
                </div>
            </div>
            `;

            threadSection.appendChild(threadEditor);
        }
        threadSection.querySelector('.thread-editor-container').insertAdjacentHTML('beforebegin', replyMessage);
    },

    addNoteProfile: function (noteData, noteType, isOwner) {
        let notesContainer = document.querySelector(noteType === 'saved' ? '.sv-notes-container' : '.notes-container')
        let noteElementID = `${noteType === 'saved' ? "sv-note" : "own-note"}-${noteData.noteID}`
        let existingNote = notesContainer.querySelector(`#${noteElementID}`)

        if (!existingNote) {
            let noteCard = `
                <div class="note-card" id="${noteElementID}">
                    <img class="profile-note-card-thumbnail" src='${noteData.noteThumbnail}' alt="Note Thumbnail" onclick="window.location.href='/view/${noteData.noteID}'">
                    <h3 id="note-title">
                        ${noteData.noteTitle.length > 25 ? `${noteData.noteTitle.slice(0, 25)}...` : noteData.noteTitle}
                    </h3>
                    <div class="note-card__tr">
                        ${noteType === 'saved' ? `<span class="note-author-name">Posted by <b>${noteData.ownerDisplayName}</b></span>` : ``}
                        ${isOwner ? `
                            <span class="note-author-name delete-option">Delete note</span>
                            <div class="user-profile-note-action-items" data-id="${noteData.noteID}" data-notetitle="${noteData.noteTitle}" onclick="deleteNote(this)">
                                <svg class="user-profile-note-download-icon" width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <rect width="28" height="28" fill="white"/>
                                    <path d="M9 9H19M11 9V7C11 6.44772 11.4477 6 12 6H16C16.5523 6 17 6.44772 17 7V9M12 13V18M16 13V18M6 9H22L20.5 22C20.3914 22.8242 19.7103 23.5 18.8824 23.5H9.11765C8.28972 23.5 7.60862 22.8242 7.5 22L6 9Z" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>    
                            </div>
                        ` : ``} 
                    </div>
                </div>`
            notesContainer.insertAdjacentHTML('afterbegin', noteCard);
        }
    },

    addAllFeedback: function (feedback) {
    let commentsContainer = document.querySelector('.cmnts-list')

    let template = `
        <div class="main__author-threadline-wrapper" onclick="window.location.href='/user/${feedback[0].commenterDocID.username}'" >
            <img src="${feedback[0].commenterDocID.profile_pic}" 
            onclick="window.location.href='/user/${feedback[0].commenterDocID.username}'"
            alt="User Avatar" class="main__cmnt-author-img cmnt-author-img" />
            <div class="thread-line"></div>
        </div>

        <div class='main__cmnts-replies-wrapper'>
            <div class="main__body cmnt-body-3rows">
                <div class="main__reply-info reply-info"> 
                    <span id="parentFeedbackDocID" style="display: none;">${feedback[0]._id}</span>
                    <span id="commenterUsername" style="display: none;">${feedback[0].commenterDocID.username}</span> 
                    <span class="main__author-name" onclick="window.location.href='/user/${feedback[0].commenterDocID.username}'">${feedback[0].commenterDocID.displayname}</span>
                    <span class="reply-date">${this.formatDate(feedback[0].createdAt)}</span>
                </div>
                <div class='reply-msg'>${feedback[0].feedbackContents}</div>
                <div class="main__engagement-opts engagement-opts">
                    <div class="like-wrapper" data-noteid='${feedback[0].noteDocID}' data-feedbackid="${feedback[0]._id}" data-isupvoted="${feedback[0].isUpVoted}" onclick="upvoteComment(this)">
                        <svg class="like-icon" data-tippy-content="Like" width="20" height="22" viewBox="0 0 115 117" fill="none" xmlns="http://www.w3.org/2000/svg">
                            ${feedback[0].isUpVoted ?
                                `<path class='like-icon-fill' d="M28.4938 47.5373C28.4938 47.5373 28.4863 108.91 28.493 110.455C28.4996 112 84.4861 110.998 88.993 110.998C93.5 110.998 108.994 88.5431 109.494 70.581C109.994 52.6188 107.998 49.9985 107.498 49.9985L66 49.9982C78.4744 33.916 62.958 -7.56607 57.9956 8.99958C53.0332 25.5652 49.9956 32.4996 49.9956 32.4996L28.4938 47.5373Z" fill="black"/>` :
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
                                <span class="main__author-name" onclick="window.location.href='/user/${reply.commenterDocID.username}'">${reply.commenterDocID.displayname}</span>
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
                }).join('')}
            </div>
        </div>
    `

    let mainCommentContainer = document.createElement('div')
    mainCommentContainer.classList.add('main-cmnt-container')
    mainCommentContainer.innerHTML = template
    commentsContainer.appendChild(mainCommentContainer)
},

    addRequest: function (request) {
        let requestContainer = document.querySelector('.requests-container')
        let existingRequest = requestContainer.querySelector(`#request-${request.recID}`)

        if (!existingRequest) {
            let recTemplate = `
                <div class="request" id="request-${request.recID}" data-senderusername="${request.senderUserName}" onclick="manageRequest(this)">
                    <div class="request__fr">
                        <span class="open-request-card">
                            <svg width="15" height="auto" class="request-chevron-icon" viewBox="0 0 60 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 4.5L30 29.5L55 4.5" stroke="#1E1E1E" stroke-width="8.33333" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                        <span class="request__fr--requester-name">${request.senderDisplayName}'s Request</span>
                        <span class="request__fr--requested-date">${(new Date(request.createdAt)).toLocaleDateString()}</span>
                    </div>
                    <div class="request__sr">
                        <p class="request__sr--request-desc">${request.message}</p>
                        <div class="request__sr--request-action-update">
                        <button class="btn-request btn-accept-request">
                            Accept
                            <svg class="req-accept-icon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 30 30">
                                <path d="M 26.980469 5.9902344 A 1.0001 1.0001 0 0 0 26.292969 6.2929688 L 11 21.585938 L 4.7070312 15.292969 A 1.0001 1.0001 0 1 0 3.2929688 16.707031 L 10.292969 23.707031 A 1.0001 1.0001 0 0 0 11.707031 23.707031 L 27.707031 7.7070312 A 1.0001 1.0001 0 0 0 26.980469 5.9902344 z"></path>
                            </svg>
                        </button>
                        <button class="btn-request btn-reject-request">
                            Reject
                            <svg class="req-reject-icon" width="12" height="12" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 3L67 67" stroke="black" stroke-width="6" stroke-linejoin="round"/>
                                <path d="M67 3L3 67" stroke="black" stroke-width="6" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>`
            requestContainer.insertAdjacentHTML('beforeend', recTemplate)
        }
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


const linkElement = document.querySelector('._link_');
let noteTitle = undefined
function setupShareModal(container, isPost = 'false') {
    let noteID = container.getAttribute('data-noteid')
    if (isPost === 'false') {
        noteTitle = container.getAttribute('data-notetitle')
    }

    const shareNoteModal = document.querySelector('.share-note-overlay');
    const closeNoteModalBtn = document.querySelector('.close-share-note-modal');

    if (!shareNoteModal || !closeNoteModalBtn || !linkElement) {
        console.error('One or more required elements are not found');
        return;
    }

    // Open the modal and populate the link (immediate execution)
    shareNoteModal.style.display = 'flex';
    linkElement.innerHTML = isPost === 'false' ? `${window.location.origin}/view/${noteID}` : `${window.location.origin}/view/quick-post/${noteID}`;
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
    let partial = noteTitle ? `note "${noteTitle}"` : 'post'

    let messages = [
        `Check out this ${partial} on NoteRoom: ${linkElement}`,
        `Explore this amazing ${partial} on NoteRoom: ${linkElement}`,
        `Take a look at this ${partial} I found on NoteRoom: ${linkElement}`,
        `Don't miss this ${partial} on NoteRoom! Check it out here: ${linkElement}`,
        `Here's something worth reading "${noteTitle}" on NoteRoom: ${linkElement}`,
        `Check out this awesome ${partial} on NoteRoom: ${linkElement}`,
        `I came across this great ${partial} on NoteRoom, have a look: ${linkElement}`,
        `Found something interesting ${partial} on NoteRoom! See it here: ${linkElement}`,
        `This ${partial} on NoteRoom is worth your time: ${linkElement}`,
        `Take a moment to check out this ${partial} on NoteRoom: ${linkElement}`,
        `Here's a ${partial} you'll find interesting on NoteRoom: ${linkElement}`
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
    manageNotes[isSaved === "true" ? "removeSaveNote" : "addSaveNote"]({ noteTitle, noteID: noteDocID })

    let response = await fetch(url, {
        method: 'post',
        body: noteData
    })
    let body = await response.json()
    if (body.ok) {
        isSaved === "false" ? (async function () {
            Swal.fire(toastData('success', 'Note saved successfully!'))
            await manageDb.add('savedNotes', body.savedNote[0])
        })() : (function () {
            manageDb.delete('savedNotes', { idPath: "noteID", id: noteDocID })
            body.count !== 0 || (document.querySelector('.no-saved-notes-message').classList.remove('hide'))
        })()

        svButton.removeAttribute('data-disabled')
    } else {
        Swal.fire(toastData('error', "Couldn't save. Try again.", 3000))
    }
}



//* Search Notes: All Pages
async function searchNotes() {
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
        let response = await fetch(`/api/search/note?q=${encodeURIComponent(searchTerm)}`) // 2
        let notes = await response.json() // 3
        status.style.display = 'none' // End of loading
        if (notes.length > 0) {
            status.style.display = 'none'
            notes.forEach(note => {
                searchedResults.insertAdjacentHTML('afterbegin', `
                    <a href="/view/${note._id}" style="text-decoration: none;">
                        <div class="results-card" id="note-${note._id}">
                            <p class="result-note-title">${note.title}</p>
                            <svg style="transform: rotate(135deg)" width="15" height="auto" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z" fill="#1D1B20"/>
                            </svg>
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

//* Adding notifications: all pages

function addNoti(notiData) {
    manageNotes.addNoti(notiData)
    notificationCount++;
    updateNotificationBadge();
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


try {
    // Mobile control panel button
    const rightPanel = document.querySelector('.right-panel');
    const panelOpener = document.querySelector('.mbl-ctrl-panel--rp-opener');

    panelOpener.addEventListener('click', () => {
        rightPanel.classList.toggle('show');
    });
} catch (error) {
    console.log(error.message);
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

window.addEventListener('load', async () => {
    
})

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".threads-component__subject").forEach((element) => {
      element.addEventListener("click", function () {
        Swal.fire({
          title: "Unlock Threads and Join Exclusive Discussions! 🚀",
          html: `<p>Want to join the most insightful study groups on NoteRoom? Start <b>uploading notes</b>, <b>helping others with requests</b>, <b>sharing insights</b>, and <b>engaging with fellow learners</b> to unlock <b>Threads</b>—your gateway to structured, chapter-wise discussions.</p>
                 <p>💡 <b>The most active contributors are already in! Don’t miss out. Start engaging today!</b></p>`,
          icon: "info",
          confirmButtonText: "Start Now!",
        });
      });
    });
  });
  
// @ Threads Update Pop Up
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".threads-component__subject").forEach((element) => {
      element.addEventListener("click", function () {
        Swal.fire({
          title: "🔓 Unlock Threads & Join the Conversation!",
          html: `
            <p class="swal-description">
              Start by sharing your notes, engaging with others, and giving feedback. 
              Keep contributing, and you’ll be able to join discussions as well!
            </p>
            <div class="swal-body-image-container">
              <img src="\\images\\threads-unload-update.png" alt="Threads Feature Image" class="swal-body-image">
            </div>
          `,
          background: "", 
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-button'
          },
          showConfirmButton: true,
          confirmButtonText: "Got it!",
        });
      });
    });
  });
  