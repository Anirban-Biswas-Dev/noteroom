const host = 'http://localhost:2000'
const socket = io(host)

let noteCardsHtml = "";

noteCards.forEach((noteCard) => {
  noteCardsHtml += `<div class="feed-note-card">
                <div class="thumbnail-container">
        <img class="thumbnail" src="/images/${noteCard.thumbnail}">
        <button class="save-note-btn" id="save-btn-${noteCard.id}">
    <i class="fa-regular fa-bookmark"></i>
    <i class="fa-solid fa-bookmark saved"></i>
</button>
    </div>
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
        <div class="notification" id="${feedbackData.notiID}">
            <div class="first-row">
                <span class="notification-title">
                    <a href='/view/${feedbackData.noteDocID}'>${truncatedTitle(feedbackData.nfnTitle)}</a>
                </span>
                <span class="remove-notification" onclick="deleteNoti('${feedbackData.notiID}')">&times;</span>
            </div>
            <div class="notification-msg">
                <a href='/user/${feedbackData.commenterStudentID}'>${feedbackData.commenterDisplayName}</a> has given a feedback in your notes! Check that out.
            </div>
        </div>`;
    
        document.querySelector('.notifications-container').insertAdjacentHTML('afterbegin', notificationHtml);
        const nftShake = document.querySelector('.mobile-nft-btn')
        nftShake.classList.add('shake');
        
        setTimeout(() => {
            nftShake.classList.remove('shake');
        }, 300);
        
        console.log(nftShake);
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

function deleteNoti(id) {
    let notification = document.getElementById(id) // getting the exact notification which is clicked to remove by its unique ID
    notification.style.display = 'none' // Just removing the notification from the front-end
    socket.emit('delete-noti', id) // Sending an event to remove the notification from database
}

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
// Saved notes functionality for adding visual effect when saved. 

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.save-note-btn');
  
    buttons.forEach(button => {
      const isSaved = button.classList.contains('saved');
      const iconRegular = button.querySelector('.fa-regular');
      const iconSolid = button.querySelector('.fa-solid');
      
      iconRegular.style.display = isSaved ? 'none' : 'inline';
      iconSolid.style.display = isSaved ? 'inline' : 'none';
  
      button.addEventListener('click', () => {
        if (iconRegular.style.display === 'none') {
          iconRegular.style.display = 'inline';
          iconSolid.style.display = 'none';
          button.classList.remove('saved');
        } else {
          iconRegular.style.display = 'none';
          iconSolid.style.display = 'inline';
          button.classList.add('saved');
          
          button.classList.add('active');
          setTimeout(() => button.classList.remove('active'), 600); 
  
          createConfetti(button);
        }
      });
    });
  });
  
  function createConfetti(button) {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti';
    button.appendChild(confettiContainer);
  
    for (let i = 0; i < 50; i++) {
      const confettiPiece = document.createElement('div');
      confettiPiece.className = 'confetti-piece';
      confettiPiece.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
      confettiPiece.style.top = `${Math.random() * 100}%`;
      confettiPiece.style.left = `${Math.random() * 100}%`;

      const size = Math.random() * 8 + 4; 
      confettiPiece.style.width = `${size}px`;
      confettiPiece.style.height = `${size}px`;
      confettiPiece.style.opacity = 1;
      
      confettiContainer.appendChild(confettiPiece);
  
      confettiPiece.animate([
        { transform: `translateY(0) rotate(${Math.random() * 360}deg)` },
        { transform: `translateY(${Math.random() * -300}px) rotate(${Math.random() * 360}deg)` }
      ], {
        duration: 1500 + Math.random() * 1000,
        easing: 'ease-out',
        fill: 'forwards'
      });
    }

    setTimeout(() => confettiContainer.remove(), 2000);
  }
  
  
  
  



  
