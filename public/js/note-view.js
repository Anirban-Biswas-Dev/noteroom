const host = window.location.origin;
const socket = io(host);

/*
# Event Sequence:
~   1. join-room: to server : request server to join the room of that note
~   2. feedback: to server : give the feedback and other assoc. data to add the feedbacks to db
~   3. add-feedback: from server : add the responsed extented feedback data with commenter's information   
*/

socket.emit(
  "join-room",
  window.location.pathname.split(
    "/"
  )[2] /* The note-id as the unique room name */
);

//* Broadcasted feedback handler. The extented-feedback is broadcasted
// socket.on('add-feedback', (feedbackData) => {
//   manageNotes.addFeedback(feedbackData)
// })

function formatDate(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Dhaka',
    hour12: true
  });
  const formattedDate = formatter.format(date);
  return formattedDate
}

const slides = document.querySelectorAll(".carousel-slide");
const nextButton = document.querySelector(".next");
const prevButton = document.querySelector(".prev");
let currentIndex = 0;

function showSlide(index) {
  const offset = -index * 100;
  document.querySelector(
    ".carousel-wrapper"
  ).style.transform = `translateX(${offset}%)`;
}

nextButton.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
});

prevButton.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(currentIndex);
});

// Initially show the first slide
showSlide(currentIndex);

let kickUser = document.querySelector('.kick')
if (kickUser) {
  setTimeout(() => {
    alert('Please login to continue!')
    kickUser.click()
  }, 3000)
}

// Custom smooth scrolling function
/*
PROCESS EXPLANATION:

1. When the DOM is fully loaded, the script waits for the hash part of the URL (anything after `#`).
2. If a hash is found, the script extracts the part after `#` and checks if there's an element on the page with the same ID.
3. If the ID corresponds to an element (either a generic section like "#feedbacks" or a dynamic ID), it triggers a smooth scroll animation.
4. The smooth scroll smoothly moves the page to the target element over a specified duration.
5. After the scroll is complete, a highlight effect is applied to the element.
6. For "#feedbacks", the element is highlighted with a grayish shade (`#F0F0F0`).
7. For other dynamically generated IDs, the element is highlighted with a yellow shade (`#FFD700`).
8. The highlight is done through a subtle blinking effect, where the element changes its background color a few times before returning to the original color.

*/

document.addEventListener("DOMContentLoaded", function () {
  // 1
  const hash = window.location.hash; // 2

  if (hash) {
    const rawHash = hash.substring(1); // 2

    const section = document.getElementById(rawHash); // 3

    if (section) {
      if (rawHash === "feedbacks") {
        // 6
        smoothScrollTo(section, 1000, 100, () =>
          highlightSection(section, "#F0F0F0")
        );
      } else {
        // 7
        smoothScrollTo(section, 1000, 100, () =>
          highlightSection(section, "#fffdaf")
        );
      }
    }
  }
});

// Function for smooth scrolling animation
function smoothScrollTo(
  element,
  duration = 1000,
  offset = 100,
  callback = null
) {
  const targetPosition = element.getBoundingClientRect().top - offset; // 4
  const startPosition = window.pageYOffset;
  const distance = targetPosition;
  let startTime = null;

  function animationScroll(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);

    if (timeElapsed < duration) {
      requestAnimationFrame(animationScroll);
    } else {
      if (callback) callback(); // Step 5:
    }
  }

  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animationScroll);
}

// Function to highlight the section with a blink effect
function highlightSection(element, highlightColor = "#F0F0F0") {
  const originalColor = getComputedStyle(element).backgroundColor; // 5

  element.style.transition = 'background-color 0.3s ease';

  // First blink (highlight color)
  element.style.backgroundColor = highlightColor;

  setTimeout(() => {
    // Second blink (back to original)
    element.style.backgroundColor = originalColor;

    setTimeout(() => {
      // Final highlight (highlight color)
      element.style.backgroundColor = highlightColor;

      setTimeout(() => {
        // Return to the original color
        element.style.backgroundColor = originalColor;
      }, 300);
    }, 300);
  }, 300);
}

const tribute = new Tribute({
  lookup: "displayname",
  trigger: "@",
  selectTemplate: function (item) {
    return `@${item.original.username}`
  },
  menuItemTemplate: function (item) {
    return `
    <div class="mention-modal">
    <img src="${item.original.profile_pic}" class="mention__user-pic">
    <p class="mention__user-dname" >${item.original.displayname}</p>          
    </div>
        `;

  },
  values: async (text, callback) => {
    try {
      let response = await fetch(`/api/searchUser?term=${text}`)
      if (!response.ok) console.log(`No network connection!`)
      let data = await response.json()
      callback(data)
    } catch (error) {
      console.log(error)
    }
  }
})
tribute.attach(document.querySelector('#editor'))



toastui.Editor.codeBlockLanguages = [];

const editor = new toastui.Editor({
  el: document.querySelector("#editor"),
  initialEditType: "wysiwyg",
  previewStyle: "none",
  height: "200px",
  hideModeSwitch: true,
  placeholder: "Give a feedback",
  toolbarItems: [["bold", "italic", "strike"], ["link"], ["image"]],
});

tippy("[data-tippy-content]", {
  placement: "top",
  theme: "light",
});

// *****   Complete Frontend Thread Related  *******


function autoResize() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
}

// I'm adjusting the height of the threadline through this.

function adjustThreadLineHeights() {
  const containers = document.querySelectorAll(".main-cmnt-container");

  containers.forEach((container) => {
    const threadLine = container.querySelector(".thread-line");
    const contentWrapper = container.querySelector(
      ".main__cmnts-replies-wrapper"
    );

    // Function to adjust the height of the thread line
    const adjustHeight = () => {
      const height = contentWrapper.offsetHeight; // Measure the content height
      threadLine.style.height = `${height}px`; // Apply it to the thread line
    };

    // Perform initial adjustment
    adjustHeight();

    // Use ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(() => adjustHeight());
    resizeObserver.observe(contentWrapper);

    // Store the observer on the element for cleanup if needed
    container._resizeObserver = resizeObserver;
  });
}
// Auto adjust textarea height for thread editor 
replyTextArea = document.querySelectorAll(".thread-editor");
replyTextArea.forEach(function (textarea) {
  textarea.addEventListener("input", autoResize);
});

// Make these dynamic with backend plz :)

document.addEventListener('DOMContentLoaded', () => {
  const commentList = document.querySelector(".cmnts-list");
  const cmntBtn = document.querySelector("#cmnt-btn");

  // Function to post a main comment
  const pathname = window.location.pathname
  const noteDocID = window.location.pathname.split("/")[2]; // Note's document ID
  const commenterStudentID = Cookies.get("studentID"); // Commenter's document ID

  const postMainComment = async () => {
    const commentHTML = editor.getHTML(); // feedback text
    if (!commentHTML.trim()) return; // Preventing any empty comments

    const feedbackData = new FormData()
    feedbackData.append('noteDocID', noteDocID)
    feedbackData.append('commenterStudentID', commenterStudentID)
    feedbackData.append('feedbackContents', commentHTML)

    let response = await fetch(`${pathname.endsWith('/') ? pathname : pathname + '/'}postFeedback`, {
      body: feedbackData,
      method: 'post'
    })
    let data = await response.json()

    if (!data) return

    // Main comment container
    const mainCommentContainer = document.createElement('div');
    mainCommentContainer.classList.add('main-cmnt-container');

    // Now we add dynamic HTML template on the main comment
    mainCommentContainer.innerHTML = `
          <div class="main__author-threadline-wrapper">
               <img
                 src="${data.feedback.commenterDocID.profile_pic}"
                 alt="User Avatar"
                 class="main__cmnt-author-img cmnt-author-img"
               />
               <div class="thread-line"></div>
             </div>
             <div class="main__cmnts-replies-wrapper">
               <div class="main__body cmnt-body-3rows">
                 <div class="main__reply-info reply-info">
                   <span class="main__author-name">${data.feedback.commenterDocID.displayname}</span>
                   <span class="reply-date">${formatDate(new Date(data.feedback.createdAt))}</span>
                 </div>
                 <div class="main__reply-msg reply-msg">${data.feedback.feedbackContents}</div>
                 <div class="main__engagement-opts engagement-opts">
                   <div class="vote-container">
                     <div class="uv-container">
                       <svg class="uv-icon" width="15" height="16" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M20.293 10.2935L19.5859 11.0006L20.293 10.2935ZM10.2929 1.70717L9.58575 1.00008L10.2929 1.70717ZM9.58575 1.00008L0.999862 9.58646L2.41412 11.0006L11 2.41425L9.58575 1.00008ZM2.41412 13.0006H6V11.0006H2.41412V13.0006ZM6 13.0006V19.5H8V13.0006H6ZM9.5 23H12.5V21H9.5V23ZM16 19.5V13.0006H14V19.5H16ZM16 13.0006H19.5859V11.0006H16V13.0006ZM21.0001 9.58646L12.4143 1.00008L11 2.41425L19.5859 11.0006L21.0001 9.58646ZM19.5859 13.0006C21.3677 13.0006 22.26 10.8464 21.0001 9.58646L19.5859 11.0006L19.5859 11.0006V13.0006ZM16 13.0006L16 13.0006V11.0006C14.8954 11.0006 14 11.8961 14 13.0006H16ZM12.5 23C14.433 23 16 21.433 16 19.5H14C14 20.3284 13.3284 21 12.5 21V23ZM6 19.5C6 21.433 7.567 23 9.5 23V21C8.67157 21 8 20.3284 8 19.5H6ZM6 13.0006L6 13.0006H8C8 11.8961 7.10457 11.0006 6 11.0006V13.0006ZM0.999862 9.58646C-0.260013 10.8464 0.632334 13.0006 2.41412 13.0006V11.0006L2.41412 11.0006L0.999862 9.58646ZM11 2.41425L11 2.41425L12.4143 1.00008C11.6332 0.218978 10.3668 0.218978 9.58575 1.00008L11 2.41425Z" fill="black"/>
                         </svg>									
                       <span class="uv-count">0</span>
                     </div>
                     <div class="divider-uv-dv"></div>
                     <div class="dv-container">
                     <svg class="dv-icon" width="15" height="16" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M1.72696 13.8523L2.42297 13.1343L1.72696 13.8523ZM11.8598 22.2816L12.5779 22.9776L11.8598 22.2816ZM12.5779 22.9776L21.0288 14.2583L19.5926 12.8664L11.1418 21.5856L12.5779 22.9776ZM19.5614 10.8666L15.976 10.9226L16.0072 12.9223L19.5926 12.8664L19.5614 10.8666ZM15.976 10.9226L15.8746 4.42398L13.8748 4.45518L13.9762 10.9538L15.976 10.9226ZM12.3204 0.979002L9.3208 1.0258L9.352 3.02556L12.3516 2.97876L12.3204 0.979002ZM5.87582 4.57998L5.97721 11.0786L7.97697 11.0474L7.87558 4.54878L5.87582 4.57998ZM5.97721 11.0786L2.39177 11.1345L2.42297 13.1343L6.00841 13.0783L5.97721 11.0786ZM1.03095 14.5703L9.74973 23.0217L11.1418 21.5856L2.42297 13.1343L1.03095 14.5703ZM2.39177 11.1345C0.6102 11.1623 -0.24843 13.3302 1.03095 14.5703L2.42297 13.1343L2.42297 13.1343L2.39177 11.1345ZM5.97721 11.0786L5.97721 11.0786L6.00841 13.0783C7.11285 13.0611 7.9942 12.1518 7.97697 11.0474L5.97721 11.0786ZM9.3208 1.0258C7.38804 1.05596 5.84567 2.64721 5.87582 4.57998L7.87558 4.54878C7.86266 3.72045 8.52367 3.03848 9.352 3.02556L9.3208 1.0258ZM15.8746 4.42398C15.8445 2.49122 14.2532 0.948848 12.3204 0.979002L12.3516 2.97876C13.18 2.96584 13.8619 3.62685 13.8748 4.45518L15.8746 4.42398ZM15.976 10.9226L15.976 10.9226L13.9762 10.9538C13.9935 12.0582 14.9028 12.9395 16.0072 12.9223L15.976 10.9226ZM21.0288 14.2583C22.2689 12.9789 21.343 10.8388 19.5614 10.8666L19.5926 12.8664L19.5926 12.8664L21.0288 14.2583ZM11.1418 21.5856L11.1418 21.5856L9.74973 23.0217C10.5429 23.7905 11.8091 23.7708 12.5779 22.9776L11.1418 21.5856Z" fill="black"/>
                       </svg>
                     </div>
                   </div>
                   <svg 
                   class="reply-icon thread-opener"
                   data-tippy-content="Reply"
                   width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" stroke-width="1.14582" stroke-linecap="round" stroke-linejoin="round"/>
                     </svg>                    
                 </div>
               </div>
               <div class="thread-section"></div>
             </div>
      `;

    commentList.prepend(mainCommentContainer); // this adds the main comment at the top. Things will of course change when we'll have upvote downvote based ranking
    adjustThreadLineHeights();
    editor.setHTML(''); // reseting toast ui editor content
  };

  cmntBtn.addEventListener("click", postMainComment);

  // Function to setup thread reply listeners

  const setupThreadReplyListeners = () => {
    // Use event delegation to handle clicks on the comment list
    commentList.addEventListener('click', async (event) => {
      // Handle opening the thread editor
      if (event.target.classList.contains('thread-opener')) {
        const threadSection = event.target.closest('.main__cmnts-replies-wrapper').querySelector('.thread-section');

        // Remove any existing thread editors in other sections before adding a new one
        document.querySelectorAll('.thread-editor-container').forEach(editor => {
          editor.remove();
        });

        // Check if thread editor already exists
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

          // Append the editor to the thread section
          threadSection.appendChild(threadEditor);
        }

        // Focus on the textarea of the newly created or existing editor
        const textarea = threadEditor.querySelector('.thread-editor');
        textarea.focus();
      }

      // Handle posting replies
      if (event.target.closest('.thread__cmnt-btn')) {
        const textarea = event.target.closest('.thread-editor-container').querySelector('.thread-editor');
        const replyContent = textarea.value.trim();

        if (!replyContent) return; // Prevents posting empty replies

        // this creates a reply message container


        const threadSection = event.target.closest('.thread-section');
        const parentFeedbackDocID = threadSection.previousElementSibling.querySelector('.reply-info #parentFeedbackDocID').innerHTML
        const replyData = new FormData()
        replyData.append('noteDocID', noteDocID)
        replyData.append('commenterStudentID', commenterStudentID)
        replyData.append('replyContent', replyContent)
        replyData.append('parentFeedbackDocID', parentFeedbackDocID)
        replyData.append('reply', true)

        let response = await fetch(`${pathname.endsWith('/') ? pathname : pathname + '/'}postFeedback`, {
          body: replyData,
          method: 'post'
        })
        let data = await response.json()
        if (data.reply) {
          const replyMessage = document.createElement('div');
          replyMessage.classList.add('thread-msg');
          replyMessage.innerHTML = `
                    <img src="${data.reply.commenterDocID.profile_pic}" alt="User Avatar" class="cmnt-author-img thread-avatar">
                    <div class="cmnt-body-3rows">
                        <div class="reply-info">
                            <span class="main__author-name">${data.reply.commenterDocID.displayname}</span>
                            <span class="reply-date">${formatDate(new Date(data.reply.createdAt))}</span>
                        </div>
                        <div class="reply-msg">${data.reply.feedbackContents}</div>
                        <div class="main__engagement-opts engagement-opts">
                        <div class="vote-container">
                          <div class="uv-container">
                            <svg class="uv-icon" width="15" height="16" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20.293 10.2935L19.5859 11.0006L20.293 10.2935ZM10.2929 1.70717L9.58575 1.00008L10.2929 1.70717ZM9.58575 1.00008L0.999862 9.58646L2.41412 11.0006L11 2.41425L9.58575 1.00008ZM2.41412 13.0006H6V11.0006H2.41412V13.0006ZM6 13.0006V19.5H8V13.0006H6ZM9.5 23H12.5V21H9.5V23ZM16 19.5V13.0006H14V19.5H16ZM16 13.0006H19.5859V11.0006H16V13.0006ZM21.0001 9.58646L12.4143 1.00008L11 2.41425L19.5859 11.0006L21.0001 9.58646ZM19.5859 13.0006C21.3677 13.0006 22.26 10.8464 21.0001 9.58646L19.5859 11.0006L19.5859 11.0006V13.0006ZM16 13.0006L16 13.0006V11.0006C14.8954 11.0006 14 11.8961 14 13.0006H16ZM12.5 23C14.433 23 16 21.433 16 19.5H14C14 20.3284 13.3284 21 12.5 21V23ZM6 19.5C6 21.433 7.567 23 9.5 23V21C8.67157 21 8 20.3284 8 19.5H6ZM6 13.0006L6 13.0006H8C8 11.8961 7.10457 11.0006 6 11.0006V13.0006ZM0.999862 9.58646C-0.260013 10.8464 0.632334 13.0006 2.41412 13.0006V11.0006L2.41412 11.0006L0.999862 9.58646ZM11 2.41425L11 2.41425L12.4143 1.00008C11.6332 0.218978 10.3668 0.218978 9.58575 1.00008L11 2.41425Z" fill="black"/>
                              </svg>									
                            <span class="uv-count">0</span>
                          </div>
                          <div class="divider-uv-dv"></div>
                          <div class="dv-container">
                          <svg class="dv-icon" width="15" height="16" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.72696 13.8523L2.42297 13.1343L1.72696 13.8523ZM11.8598 22.2816L12.5779 22.9776L11.8598 22.2816ZM12.5779 22.9776L21.0288 14.2583L19.5926 12.8664L11.1418 21.5856L12.5779 22.9776ZM19.5614 10.8666L15.976 10.9226L16.0072 12.9223L19.5926 12.8664L19.5614 10.8666ZM15.976 10.9226L15.8746 4.42398L13.8748 4.45518L13.9762 10.9538L15.976 10.9226ZM12.3204 0.979002L9.3208 1.0258L9.352 3.02556L12.3516 2.97876L12.3204 0.979002ZM5.87582 4.57998L5.97721 11.0786L7.97697 11.0474L7.87558 4.54878L5.87582 4.57998ZM5.97721 11.0786L2.39177 11.1345L2.42297 13.1343L6.00841 13.0783L5.97721 11.0786ZM1.03095 14.5703L9.74973 23.0217L11.1418 21.5856L2.42297 13.1343L1.03095 14.5703ZM2.39177 11.1345C0.6102 11.1623 -0.24843 13.3302 1.03095 14.5703L2.42297 13.1343L2.42297 13.1343L2.39177 11.1345ZM5.97721 11.0786L5.97721 11.0786L6.00841 13.0783C7.11285 13.0611 7.9942 12.1518 7.97697 11.0474L5.97721 11.0786ZM9.3208 1.0258C7.38804 1.05596 5.84567 2.64721 5.87582 4.57998L7.87558 4.54878C7.86266 3.72045 8.52367 3.03848 9.352 3.02556L9.3208 1.0258ZM15.8746 4.42398C15.8445 2.49122 14.2532 0.948848 12.3204 0.979002L12.3516 2.97876C13.18 2.96584 13.8619 3.62685 13.8748 4.45518L15.8746 4.42398ZM15.976 10.9226L15.976 10.9226L13.9762 10.9538C13.9935 12.0582 14.9028 12.9395 16.0072 12.9223L15.976 10.9226ZM21.0288 14.2583C22.2689 12.9789 21.343 10.8388 19.5614 10.8666L19.5926 12.8664L19.5926 12.8664L21.0288 14.2583ZM11.1418 21.5856L11.1418 21.5856L9.74973 23.0217C10.5429 23.7905 11.8091 23.7708 12.5779 22.9776L11.1418 21.5856Z" fill="black"/>
                            </svg>
                          </div>
                        </div>
                        <svg 
                        class="reply-icon thread-opener"
                        data-tippy-content="Reply"
                        width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" stroke-width="1.14582" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>                    
                      </div>
                    </div>
                `;

          threadSection.insertBefore(replyMessage, threadSection.querySelector('.thread-editor-container'));

          adjustThreadLineHeights(); // Adjust thread height again
          textarea.value = '';
        }


        // Insert the new reply message before the editor
      }
    });
  };

  // Initialize setup when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    setupThreadReplyListeners();
  });


  setupThreadReplyListeners(); // Initialize reply listeners on page load
});
