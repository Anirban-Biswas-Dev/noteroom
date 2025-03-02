const host = window.location.origin;
const socket = io(host);

let feedbackAddedObserver = new MutationObserver(entries => {
  document.querySelector('.no-comments-container').style.display = 'none';
});
feedbackAddedObserver.observe(document.querySelector('.cmnts-list'), { childList: true });

let splitted = window.location.pathname.split('/').filter(c => c !== '');
const noteDocID = splitted[splitted.length - 1];

let noteImages = [];

window.addEventListener('load', async () => {
  try {
    document.querySelector('#editor').setAttribute('data-disabled', 'true');
    let postType = document.querySelector('#postType').getAttribute('data-posttype');
    
    async function getNoteImages() {
      let imageContainer = document.querySelector('#note-image-container').querySelector('.carousel-wrapper');
    
      let imageSliderElement = (source, index) => {
        let template = `
          <div class="carousel-content">
            <span class="note-page-number">${index + 1}</span>
            <img src="${source || "/images/placeholders/unavailable_content.png"}" class="image-links" onclick="enlargeImage('${source}', '${noteDocID}', ${index})"/>
          </div>
        `;
    
        let slideDiv = document.createElement('div');
        slideDiv.classList.add('carousel-slide');
        slideDiv.innerHTML = template.trim();
        return slideDiv;
      };
    
      let response = await fetch(`/view/${noteDocID}/images`);
      noteImages = await response.json();
      document.querySelector('#note-image-loader').remove();
    
      if (noteImages.length !== 0) {
        noteImages.forEach((source, index) => {
          imageContainer.appendChild(imageSliderElement(source, index));
        });
      } else {
        document.querySelector('#note-image-container').remove();
      }
    }
    
    async function getNoteComments() {
      let response = await fetch(`/view/${noteDocID}/comments`);
      let comments = await response.json();
  
      document.querySelector('.comments-loader').remove();
  
      if (comments.length !== 0) {
        comments.forEach(feedback => {
          manageNotes.addAllFeedback(feedback);
        });
      } else {
        document.querySelector('.no-comments-container').style.display = 'flex';
      }
      document.querySelector('#editor').removeAttribute('data-disabled');
    }
    
    await getNoteImages();
    
    let commentFetchObserver = new IntersectionObserver(entries => {
      entries.forEach(async entry => {
        if (entry.isIntersecting) {
          await getNoteComments();
          adjustThreadLineHeights();
          commentFetchObserver.unobserve(document.querySelector('.cmnts-list'));
        }
      });
    }, { rootMargin: '100px' });
    commentFetchObserver.observe(document.querySelector('.cmnts-list'));
  
    const slides = document.querySelectorAll(".carousel-slide");
    const nextButton = document.querySelector(".next");
    const prevButton = document.querySelector(".prev");
    let currentIndex = 0;
  
    function showSlide(index) {
      const offset = -index * 100;
      document.querySelector(".carousel-wrapper").style.transform = `translateX(${offset}%)`;
    }
  
    nextButton.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });
    
    prevButton.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });
    
    document.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        nextButton.click();
      } else if (event.key === "ArrowLeft") {
        prevButton.click();
      }
    });

    // Add touch support for swiping
    const carouselWrapper = document.querySelector(".carousel-wrapper");
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; // Minimum distance for a swipe to register

    carouselWrapper.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].screenX;
    });

    carouselWrapper.addEventListener("touchend", (event) => {
      touchEndX = event.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
          // Swipe right: previous slide
          prevButton.click();
        } else {
          // Swipe left: next slide
          nextButton.click();
        }
      }
    });
    
    showSlide(currentIndex);
  } catch (error) {
    console.error('Error in window load:', error);
  }
});

socket.emit("join-room", noteDocID);

socket.on('add-feedback', (feedbackData) => {
  console.log(`Got that`);
  try {
    console.log(feedbackData);
    document.querySelector('div.main-cmnt-container[data-temporary=true]')?.remove();  
    manageNotes.addFeedback(feedbackData);
  } catch (error) {
    console.log(`Error`);
    console.log(error);
  }
});

socket.on('add-reply', (replyData) => {
  try {
    document.querySelector('div.thread-msg[data-temporary=true]')?.remove();
    manageNotes.addReply(document.querySelector(`#thread-${replyData.parentFeedbackDocID._id}`), replyData);
  } catch (error) {
    console.error('Error in add-reply:', error);
  }
});

socket.on('update-upvote', function (upvoteCount) {
  // Update the like count in the engagement bar
  const countElement = document.querySelector('.engagement-count');
  if (countElement) {
    countElement.textContent = `${upvoteCount} Likes`;
  }
});

// Added missing upvoteComment function
const voterStudentID = Cookies.get("studentID");

async function upvoteComment(voteContainer) {
  if (voteContainer.getAttribute('data-disabled')) return;

  voteContainer.setAttribute('data-disabled', 'true');

  const noteDocID = voteContainer.getAttribute('data-noteid');
  const isUpvoted = voteContainer.getAttribute('data-isupvoted') === "true" ? true : false;
  const feedbackDocID = voteContainer.getAttribute('data-feedbackid');

  let likeCount = voteContainer.querySelector('.like-count');
  const LIKE_SVG = `<path class='like-icon-fill' d='M28.4938 47.5373C28.4938 47.5373 28.4863 108.91 28.493 110.455C28.4996 112 84.4861 110.998 88.993 110.998C93.5 110.998 108.994 88.5431 109.494 70.581C109.994 52.6188 107.998 49.9985 107.498 49.9985L66 49.9982C78.4744 33.916 62.958 -7.56607 57.9956 8.99958C53.0332 25.5652 49.9956 32.4996 49.9956 32.4996L28.4938 47.5373Z' fill='black'/>`;
  const DISLIKE_SVG = `<path d="M107.498 49.9985C107.998 49.9985 109.994 52.6188 109.494 70.581C108.994 88.5431 93.5 110.998 88.993 110.998C84.4861 110.998 28.4996 112 28.493 110.455C28.4863 108.91 28.4938 47.5373 28.4938 47.5373L49.9956 32.4996C49.9956 32.4996 53.0332 25.5652 57.9956 8.99958C62.958 -7.56607 78.4744 33.916 66 49.9982M107.498 49.9985C106.998 49.9985 66 49.9982 66 49.9982M107.498 49.9985L66 49.9982" stroke="#606770" stroke-width="10" stroke-linecap="round"/>`;

  function replaceLikeSvg(svg, increment) {
    voteContainer.querySelector('.like-icon').innerHTML = svg;
    voteContainer.setAttribute('data-isupvoted', !isUpvoted);
    voteContainer.querySelector('.like-count').innerHTML = parseInt(likeCount.innerHTML) + (increment ? 1 : -1);
  }

  let url = `/view/${noteDocID}/vote/feedback?type=upvote${isUpvoted ? '&action=delete' : ''}`;
  replaceLikeSvg(isUpvoted ? DISLIKE_SVG : LIKE_SVG, !isUpvoted);

  let voteData = new FormData();
  voteData.append('noteDocID', noteDocID);
  voteData.append('voterStudentID', voterStudentID);
  voteData.append('feedbackDocID', feedbackDocID);

  let response = await fetch(url, {
    method: 'post',
    body: voteData
  });
  let data = await response.json();
  if (data.ok) {
    voteContainer.removeAttribute('data-disabled');
  }
}

// Added missing formatDate function
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
  return formattedDate;
}

// Added missing kickUser functionality
let kickUser = document.querySelector('.kick');
if (kickUser) {
  setTimeout(() => {
    alert('Please login to continue!');
    kickUser.click();
  }, 3000);
}

// Added upvote function for the note (since it's referenced in the HTML)
async function upvote(element) {
  if (element.getAttribute('data-disabled')) return;

  element.setAttribute('data-disabled', 'true');

  const noteId = element.getAttribute('data-noteid');
  let isUpvoted = element.getAttribute('data-isupvoted') === 'true';

  // Toggle the upvote state
  isUpvoted = !isUpvoted;
  element.setAttribute('data-isupvoted', isUpvoted.toString());

  // Update the UI
  const icon = element.querySelector('.uv-icon');
  if (isUpvoted) {
    icon.innerHTML = `
      <path
        d="M26.0497 5.76283C25.4112 5.12408 24.6532 4.61739 23.8189 4.27168C22.9845 3.92598 22.0903 3.74805 21.1872 3.74805C20.2841 3.74805 19.3898 3.92598 18.5555 4.27168C17.7211 4.61739 16.9631 5.12408 16.3247 5.76283L14.9997 7.08783L13.6747 5.76283C12.385 4.47321 10.636 3.74872 8.81216 3.74872C6.98837 3.74872 5.23928 4.47321 3.94966 5.76283C2.66005 7.05244 1.93555 8.80154 1.93555 10.6253C1.93555 12.4491 2.66005 14.1982 3.94966 15.4878L14.9997 26.5378L26.0497 15.4878C26.6884 14.8494 27.1951 14.0913 27.5408 13.257C27.8865 12.4227 28.0644 11.5284 28.0644 10.6253C28.0644 9.72222 27.8865 8.82796 27.5408 7.99363C27.1951 7.15931 26.6884 6.40127 26.0497 5.76283Z"
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
      </defs>`;
  } else {
    icon.innerHTML = `
      <path
        d="M26.0497 5.76283C25.4112 5.12408 24.6532 4.61739 23.8189 4.27168C22.9845 3.92598 22.0903 3.74805 21.1872 3.74805C20.2841 3.74805 19.3898 3.92598 18.5555 4.27168C17.7211 4.61739 16.9631 5.12408 16.3247 5.76283L14.9997 7.08783L13.6747 5.76283C12.385 4.47321 10.636 3.74872 8.81216 3.74872C6.98837 3.74872 5.23928 4.47321 3.94966 5.76283C2.66005 7.05244 1.93555 8.80154 1.93555 10.6253C1.93555 12.4491 2.66005 14.1982 3.94966 15.4878L14.9997 26.5378L26.0497 15.4878C26.6884 14.8494 27.1951 14.0913 27.5408 13.257C27.8865 12.4227 28.0644 11.5284 28.0644 10.6253C28.0644 9.72222 27.8865 8.82796 27.5408 7.99363C27.1951 7.15931 26.6884 6.40127 26.0497 5.76283Z"
        stroke="#1E1E1E"
        stroke-width="0.909091"
        stroke-linecap="round"
        stroke-linejoin="round"
      />`;
  }

  // Update the like count locally
  const countElement = element.closest('.engagement-bar').querySelector('.engagement-count');
  let count = parseInt(countElement.textContent);
  count = isUpvoted ? count + 1 : count - 1;
  countElement.textContent = `${count} Likes`;

  // Send the upvote request to the server
  let url = `/view/${noteId}/vote?type=upvote${isUpvoted ? '' : '&action=delete'}`;
  let voteData = new FormData();
  voteData.append('noteDocID', noteId);
  voteData.append('voterStudentID', voterStudentID);

  try {
    let response = await fetch(url, {
      method: 'post',
      body: voteData
    });
    let data = await response.json();
    if (data.ok) {
      element.removeAttribute('data-disabled');
      // Socket.IO will update the count via the 'update-upvote' event
    } else {
      // Revert the UI if the server request fails
      isUpvoted = !isUpvoted;
      element.setAttribute('data-isupvoted', isUpvoted.toString());
      countElement.textContent = `${parseInt(countElement.textContent) + (isUpvoted ? -1 : 1)} Likes`;
      Swal.fire(toastData('error', "Failed to update upvote", 3000));
    }
  } catch (error) {
    console.error('Error in upvote:', error);
    // Revert the UI on error
    isUpvoted = !isUpvoted;
    element.setAttribute('data-isupvoted', isUpvoted.toString());
    countElement.textContent = `${parseInt(countElement.textContent) + (isUpvoted ? -1 : 1)} Likes`;
    Swal.fire(toastData('error', "Network error, please try again", 3000));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const hash = window.location.hash;
  if (hash) {
    const rawHash = hash.substring(1);
    const section = document.getElementById(rawHash);
    if (section) {
      if (rawHash === "feedbacks") {
        smoothScrollTo(section, 1000, 100, () => highlightSection(section, "#F0F0F0"));
      } else {
        smoothScrollTo(section, 1000, 100, () => highlightSection(section, "#fffdaf"));
      }
    }
  }
});

function smoothScrollTo(element, duration = 1000, offset = 100, callback = null) {
  const targetPosition = element.getBoundingClientRect().top - offset;
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
      if (callback) callback();
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

function highlightSection(element, highlightColor = "#F0F0F0") {
  const originalColor = getComputedStyle(element).backgroundColor;
  element.style.transition = 'background-color 0.3s ease';
  element.style.backgroundColor = highlightColor;

  setTimeout(() => {
    element.style.backgroundColor = originalColor;
    setTimeout(() => {
      element.style.backgroundColor = highlightColor;
      setTimeout(() => {
        element.style.backgroundColor = originalColor;
      }, 300);
    }, 300);
  }, 300);
}

const tribute = new Tribute({
  lookup: "displayname",
  trigger: "@",
  selectTemplate: function (item) {
    return `@${item.original.username}`;
  },
  menuItemTemplate: function (item) {
    return `
    <div class="mention-modal">
      <img src="${item.original.profile_pic}" class="mention__user-pic">
      <p class="mention__user-dname">${item.original.displayname}</p>          
    </div>
    `;
  },
  values: async (text, callback) => {
    try {
      let response = await fetch(`/api/search/user?term=${text}`);
      if (!response.ok) console.log(`No network connection!`);
      let data = await response.json();
      callback(data);
    } catch (error) {
      console.log(error);
    }
  }
});
tribute.attach(document.querySelector('#editor'));

const toolbarOptions = [
  ['bold', 'italic', 'underline'],
  ['code-block'], ['link'],
  [{ 'script': 'sub' }, { 'script': 'super' }],
];

const editor = new Quill('#editor', {
  theme: 'snow',
  placeholder: "Share your thoughts and feedback here...",
  modules: {
    toolbar: toolbarOptions
  }
});

document.getElementById('editor').style.height = '200px';

function autoResize() {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
}

function adjustThreadLineHeights() {
  const containers = document.querySelectorAll(".main-cmnt-container");
  containers.forEach((container) => {
    const threadLine = container.querySelector(".thread-line");
    const contentWrapper = container.querySelector(".main__cmnts-replies-wrapper");
    const adjustHeight = () => {
      const height = contentWrapper.offsetHeight;
      threadLine.style.height = `${height}px`;
    };
    adjustHeight();
    const resizeObserver = new ResizeObserver(() => adjustHeight());
    resizeObserver.observe(contentWrapper);
    container._resizeObserver = resizeObserver;
  });
}

replyTextArea = document.querySelectorAll(".thread-editor");
replyTextArea.forEach(function (textarea) {
  textarea.addEventListener("input", autoResize);
});

document.addEventListener('DOMContentLoaded', () => {
  const commentList = document.querySelector(".cmnts-list");
  const cmntBtn = document.querySelector("#cmnt-btn");
  const commenterStudentID = Cookies.get("studentID");

  const postMainComment = async (event) => {
    event.preventDefault();
    const commentHTML = editor.root.innerHTML;
    if (editor.root.textContent.trim() === "" || document.querySelector('#editor').getAttribute('data-disabled')) return;
    document.querySelector('#editor').setAttribute('data-disabled', 'true');
    
    manageNotes.addFeedback({
      _id: '__id__',
      createdAt: new Date(),
      feedbackContents: '',
      commenterDocID: {
        profile_pic: '__profile_pic__',
        username: '__username__',
        displayname: 'User'
      },
      noteDocID: { _id: '__id__' },
      upvoteCount: 0,
      temporary: true
    });

    const feedbackData = new FormData();
    feedbackData.append('noteDocID', noteDocID);
    feedbackData.append('commenterStudentID', commenterStudentID);
    feedbackData.append('feedbackContents', commentHTML);

    let response = await fetch(`/view/${noteDocID}/postFeedback`, {
      body: feedbackData,
      method: 'post'
    });
    let data = await response.json();
    if (data.sent) {
      document.querySelector('#editor').removeAttribute('data-disabled');
      Swal.fire(toastData('success', "Feedback sent", 2000));
      editor.root.innerHTML = '';
      adjustThreadLineHeights();
    } else {
      Swal.fire(toastData('error', "Sorry, couldn't send message", 3000));
    }
  };

  cmntBtn.addEventListener("click", postMainComment);

  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      postMainComment(event);
    }
  });

  const setupThreadReplyListeners = () => {
    async function sendReply(threadContainer) {
      if (!threadContainer) return;
      const textarea = threadContainer.querySelector('.thread-editor');
      const replyContent = document.querySelector('#mentioneduser').innerHTML + " " + textarea.value.trim();
      if (!textarea.value.trim() || textarea.getAttribute('data-disabled')) return;

      textarea.setAttribute('data-disabled', 'true');
      const threadSection = threadContainer.closest('.thread-section');

      manageNotes.addReply(threadSection, {
        createdAt: new Date(),
        feedbackContents: '',
        commenterDocID: { profile_pic: '__profile_pic__', username: '__username__', displayname: 'User' },
        temporary: true
      });

      const parentFeedbackDocID = threadSection.previousElementSibling.querySelector('.reply-info #parentFeedbackDocID').innerHTML;
      const replyData = new FormData();
      replyData.append('noteDocID', noteDocID);
      replyData.append('commenterStudentID', commenterStudentID);
      replyData.append('replyContent', replyContent);
      replyData.append('parentFeedbackDocID', parentFeedbackDocID);
      replyData.append('reply', true);

      let response = await fetch(`/view/${noteDocID}/postFeedback`, { body: replyData, method: 'post' });
      let data = await response.json();
      if (data.sent) {
        textarea.removeAttribute('data-disabled');
        adjustThreadLineHeights();
        textarea.value = '';
      } else {
        Swal.fire(toastData('error', "Sorry, couldn't send the message", 3000));
      }
    }

    commentList.addEventListener('click', async (event) => {
      if (event.target.classList.contains('thread-opener')) {
        let parentCommenterUsername = event.target.parentElement.parentElement?.querySelector(".reply-info #commenterUsername").textContent;
        const threadSection = event.target.closest('.main__cmnts-replies-wrapper').querySelector('.thread-section');
        document.querySelectorAll('.thread-editor-container').forEach(editor => editor.remove());

        let threadEditor = threadSection.querySelector('.thread-editor-container');
        if (!threadEditor) {
          threadEditor = document.createElement('div');
          threadEditor.classList.add('thread-editor-container');
          threadEditor.innerHTML = `
            <div class="thread-editor-wrapper">
              <span id='mentioneduser' class="thread-mentioned-user">@${parentCommenterUsername}</span>
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

        const textarea = threadEditor.querySelector('.thread-editor');
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        textarea.focus();
      } else if (event.target.closest('.thread__cmnt-btn')) {
        const threadContainer = event.target.closest('.thread-editor-container');
        sendReply(threadContainer);
      }

      document.addEventListener("keydown", async function (event) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains("thread-editor")) {
          if (event.ctrlKey && event.key === "Enter") {
            event.preventDefault();
            const threadContainer = activeElement.closest('.thread-editor-container');
            sendReply(threadContainer);
            const mainEditor = document.querySelector('.ql-editor');
            if (mainEditor) mainEditor.innerHTML = '';
          }
        }
      });
    });
  };

  document.addEventListener("DOMContentLoaded", () => setupThreadReplyListeners());
  setupThreadReplyListeners();
});

function enlargeImage(imageSrc, noteId, initialIndex) {
  const modal = document.createElement('div');
  modal.classList.add('image-modal');

  let currentIndex = initialIndex;

  modal.innerHTML = `
    <div class="image-modal-backdrop"></div>
    <div class="image-modal-content">
      <img src="${imageSrc}" class="enlarged-image" alt="Enlarged Note Image" />
      <div class="image-modal-buttons">
        <button class="modal-carousel-control prev">
          <svg class="carousel-control-icon" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z" fill="#1D1B20"/>
          </svg>
        </button>
        <button class="image-modal-download">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16V4M12 16L8 12M12 16L16 12M20 20H4" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Download
        </button>
        <button class="image-modal-close">×</button>
        <button class="modal-carousel-control next">
          <svg class="carousel-control-icon" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M51.3971 38.1667H0.667969V29.8334H51.3971L28.0638 6.50002L34.0013 0.666687L67.3346 34L34.0013 67.3334L28.0638 61.5L51.3971 38.1667Z" fill="#1D1B20"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const logo = document.querySelector('.logo'); // Adjust selector if needed
  if (logo) logo.classList.add('highlight-logo');

  const imageElement = modal.querySelector('.enlarged-image');
  const downloadButton = modal.querySelector('.image-modal-download');

  function updateImage(index) {
    imageElement.src = noteImages[index] || "/images/placeholders/unavailable_content.png";
  }

  downloadButton.addEventListener('click', () => {
    downloadImage(noteImages[currentIndex], noteId, currentIndex);
  });

  modal.querySelector('.modal-carousel-control.prev').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + noteImages.length) % noteImages.length;
    updateImage(currentIndex);
  });

  modal.querySelector('.modal-carousel-control.next').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % noteImages.length;
    updateImage(currentIndex);
  });

  modal.querySelector('.image-modal-close').addEventListener('click', () => {
    document.body.removeChild(modal);
    if (logo) logo.classList.remove('highlight-logo');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === modal.querySelector('.image-modal-backdrop')) {
      document.body.removeChild(modal);
      if (logo) logo.classList.remove('highlight-logo');
    }
  });

  document.addEventListener('keydown', function handler(e) {
    if (e.key === "ArrowLeft") {
      currentIndex = (currentIndex - 1 + noteImages.length) % noteImages.length;
      updateImage(currentIndex);
    } else if (e.key === "ArrowRight") {
      currentIndex = (currentIndex + 1) % noteImages.length;
      updateImage(currentIndex);
    } else if (e.key === "Escape") {
      document.body.removeChild(modal);
      if (logo) logo.classList.remove('highlight-logo');
      document.removeEventListener('keydown', handler);
    }
  });
}

async function downloadImage(imageSrc, noteId, imageIndex) {
  try {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `note_${noteId}_image_${imageIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Clean up
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download the image. Please try again.');
  }
}