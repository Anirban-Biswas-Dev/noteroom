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
socket.on('add-feedback', (feedbackData) => {
  manageNotes.addFeedback(feedbackData)
  // console.log(feedbackData)
})

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

    // manageNotes.addFeedback(data)
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
          manageNotes.addReply(threadSection, data)
          adjustThreadLineHeights(); // Adjust thread height again
          textarea.value = '';
        }
      }
    });
  };

  // Initialize setup when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    setupThreadReplyListeners();
  });


  setupThreadReplyListeners(); // Initialize reply listeners on page load
});
