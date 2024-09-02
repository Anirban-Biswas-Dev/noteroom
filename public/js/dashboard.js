const host = 'http://localhost:2000'
const socket = io(host)

let noteCardsHtml = "";

noteCards.forEach((noteCard) => {
  noteCardsHtml += `<div class="feed-note-card">
                <img class="thumbnail" src="/images/${noteCard.thumbnail}">
                <div class="note-details">
                    <div class="author-info">
                        <img src="/images/${noteCard.authorImg}" class="author-img">
                        <div class="author-title-container">
                            <div class="note-title">${noteCard.noteTitle}</div>
                            <div class="author">${noteCard.noteAuthor}</div>
                        </div>
                    </div>
                    <div class="note-engagement">
                        <svg class="download-icon" width="40" height="40" viewBox="0 0 43 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M37.1541 26.5395V33.6165C37.1541 34.555 36.7813 35.455 36.1177 36.1186C35.4541 36.7822 34.5541 37.155 33.6156 37.155H8.84623C7.90776 37.155 7.00773 36.7822 6.34414 36.1186C5.68054 35.455 5.30774 34.555 5.30774 33.6165V26.5395M12.3847 17.6933L21.2309 26.5395M21.2309 26.5395L30.0771 17.6933M21.2309 26.5395V5.30859" stroke="#1E1E1E" stroke-width="2.29523" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg class="comment-icon" width="40" height="40" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M34.4051 23.9151C34.4051 24.8838 34.0257 25.8128 33.3505 26.4978C32.6753 27.1828 31.7595 27.5676 30.8045 27.5676H9.20113L2 34.8726V5.65252C2 4.68381 2.37934 3.75478 3.05458 3.0698C3.72982 2.38482 4.64564 2 5.60057 2H30.8045C31.7595 2 32.6753 2.38482 33.3505 3.0698C34.0257 3.75478 34.4051 4.68381 34.4051 5.65252V23.9151Z" stroke="#1E1E1E" stroke-width="2.40038" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <svg class="share-icon" width="40" height="40" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M30.6079 32.5223L27.8819 29.8441L36.6816 21.0444L27.8819 12.2446L30.6079 9.56641L42.0858 21.0444L30.6079 32.5223ZM3.82599 36.3483V28.6963C3.82599 26.05 4.7506 23.8023 6.59983 21.953C8.48094 20.0719 10.7446 19.1314 13.391 19.1314H25.2037L18.3169 12.2446L21.0429 9.56641L32.5209 21.0444L21.0429 32.5223L18.3169 29.8441L25.2037 22.9574H13.391C11.7968 22.9574 10.4418 23.5153 9.32584 24.6312C8.20993 25.7471 7.65197 27.1022 7.65197 28.6963V36.3483H3.82599Z" fill="#1D1B20"/>
                        </svg>
                    </div>            
                </div>
            </div>
   `;
});
document.querySelector(".feed-container").innerHTML = noteCardsHtml;

// Using the similar algorithm for dynamic notification loading

// If you think the char limit shoudld be more, define a character limit for the title
const titleCharLimit = 30;

function truncatedTitle(title) {
    let truncatedTitle =
    title.length > titleCharLimit
      ? title.slice(0, titleCharLimit) + "..."
      : title;

    return truncatedTitle
}

socket.on('note-upload', (noteData) => {
    
	// let notificationHtml = `
    // <div class="notification">
    //     <div class="first-row">
    //         <span class="notification-title">
    //             <a href='/view/${noteData.noteid}'>${truncatedTitle(noteData.nfnTitle)}</a>
    //         </span>
    //         <span class="remove-notification">&times;</span>
    //     </div>
    //     <div class="notification-msg">
    //         <a href='/user/${noteData.ownerID}'>${noteData.ownerDisplayName}</a> has uploaded a new note, check that out!
    //     </div>
    // </div>`;

    // document.querySelector('.notifications-container').insertAdjacentHTML('afterbegin', notificationHtml) 
})

socket.on('feedback-given', (feedbackData) => {
	let selfUsername = Cookies.get('recordName') // The student's username in cookie

    if(feedbackData.ownerUsername == selfUsername) { // If the note owner on which the feedback is given and the recordName are same, the notification will be kept
        let notificationHtml = `
        <div class="notification">
            <div class="first-row">
                <span class="notification-title">
                    <a href='/view/${feedbackData.noteDocID}'>${truncatedTitle(feedbackData.nfnTitle)}</a>
                </span>
                <span class="remove-notification">&times;</span>
            </div>
            <div class="notification-msg">
                <a href='/user/${feedbackData.commenterStudentID}'>${feedbackData.commenterDisplayName}</a> has given a feedback in your notes! Check that out.
            </div>
        </div>`;
    
        document.querySelector('.notifications-container').insertAdjacentHTML('afterbegin', notificationHtml) 
    }
})


// Using the similar algorithm for dynamic saved notes
const svNotesCharLimit = 38;
let savedNotesHtml = "";

savedNotes.forEach((savedNote) => {
  // Truncate the title if it exceeds the character limit
  let truncatedTitle =
    savedNote.noteTitle.length > svNotesCharLimit
      ? savedNote.noteTitle.slice(0, svNotesCharLimit) + "..."
      : savedNote.noteTitle;

  savedNotesHtml += `
    <div class="saved-note">
        <span class="sv-note-title">
            ${truncatedTitle}
        </span>
    </div>`;
});

document.querySelector(".saved-notes-container").innerHTML = savedNotesHtml;

//R: Change the snippet if you want to
document.querySelectorAll('.remove-notification').forEach(notification /* selecting each notification and adding a click event */ => {
    notification.addEventListener('click', function() {
        //R: Place your remove-notifications logic here
        alert('notifications deleted')
    })
})