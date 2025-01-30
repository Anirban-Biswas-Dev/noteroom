const host = window.location.origin;
const socket = io(host);

let feedbackAddedObserver = new MutationObserver(entries => {
  document.querySelector('.no-comments-container').style.display = 'none'
})
feedbackAddedObserver.observe(document.querySelector('.cmnts-list'), { childList: true })

let splitted = window.location.pathname.split('/')
const noteDocID = splitted[splitted.length - 1]

window.addEventListener('load', async () => {
  try {
    document.querySelector('#editor').setAttribute('data-disabled', 'true') // No feedbacks can be given until the comments are fetched
    let postType = document.querySelector('#postType').getAttribute('data-posttype')
    
    async function getNoteImages() {
      let imageContainer = document.querySelector('#note-image-container').querySelector('.carousel-wrapper')
      let imageSliderElement = (source) => {
        let template = `<img src="${source}" class="image-links"/>`
        let slideDiv = document.createElement('div')
        slideDiv.classList.add('carousel-slide')
        slideDiv.innerHTML = template.trim()
        return slideDiv
      }
  
      let response = await fetch(`/view/${noteDocID}/images`)
      let images = await response.json()
      document.querySelector('#note-image-loader').remove()
      if (images.length !== 0) {
        images.forEach(source => {
          imageContainer.appendChild(imageSliderElement(source))
        })
        if(postType === "quick-post") {
          document.querySelectorAll('.carousel-control').forEach(doc => doc.remove())
        }
      } else {
        document.querySelectorAll('.carousel-control').forEach(doc => doc.remove())
      }
    }
  
    async function getNoteComments() {
      let response = await fetch(`/view/${noteDocID}/comments`)
      let comments = await response.json()
  
      document.querySelector('.comments-loader').remove()
  
      if (comments.length !== 0) {
        comments.forEach(feedback => {
          manageNotes.addAllFeedback(feedback)
        })
      } else {
        document.querySelector('.no-comments-container').style.display = 'flex'
      }
      document.querySelector('#editor').removeAttribute('data-disabled')
    }
    
    
    await getNoteImages()
    
    let commentFetchObserver = new IntersectionObserver(entries => {
      entries.forEach(async entry => {
        if (entry.isIntersecting) {
          await getNoteComments()
          adjustThreadLineHeights(); // Adjust thread height again
          commentFetchObserver.unobserve(document.querySelector('.cmnts-list'))
        }
      })
    }, {
      rootMargin: '100px'
    })
    commentFetchObserver.observe(document.querySelector('.cmnts-list'))
  
  
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
  
    // Initially show the first slide
    showSlide(currentIndex);
  } catch (error) {}
})


socket.emit("join-room", noteDocID);

try {
} catch (error) {}

//* Broadcasted feedback handler. The extented-feedback is broadcasted
socket.on('add-feedback', (feedbackData) => {
  console.log(`Got that`)
	try {
    console.log(feedbackData)
		document.querySelector('div.main-cmnt-container[data-temporary=true]')?.remove()  
		manageNotes.addFeedback(feedbackData)
	} catch (error) {
    console.log(`Error`)
    console.log(error)
  }
})


socket.on('add-reply', (replyData) => {
	try {
		document.querySelector('div.thread-msg[data-temporary=true]')?.remove()
		manageNotes.addReply(document.querySelector(`#thread-${replyData.parentFeedbackDocID._id}`), replyData)
	} catch (error) {}
})

socket.on('update-upvote', function (upvoteCount) {
	document.querySelector('.uv-count').innerHTML = parseInt(upvoteCount)
})



const voterStudentID = Cookies.get("studentID")

async function upvoteComment(voteContainer) {
	if (voteContainer.getAttribute('data-disabled')) return

	voteContainer.setAttribute('data-disabled', 'true')

	const noteDocID = voteContainer.getAttribute('data-noteid')
	const isUpvoted = voteContainer.getAttribute('data-isupvoted') === "true" ? true : false
	const feedbackDocID = voteContainer.getAttribute('data-feedbackid')

	let likeCount = voteContainer.querySelector('.like-count')
	const LIKE_SVG = `<path class='like-icon-fill' d='M28.4938 47.5373C28.4938 47.5373 28.4863 108.91 28.493 110.455C28.4996 112 84.4861 110.998 88.993 110.998C93.5 110.998 108.994 88.5431 109.494 70.581C109.994 52.6188 107.998 49.9985 107.498 49.9985L66 49.9982C78.4744 33.916 62.958 -7.56607 57.9956 8.99958C53.0332 25.5652 49.9956 32.4996 49.9956 32.4996L28.4938 47.5373Z' fill='black'/>`
	const DISLIKE_SVG = `<path d="M107.498 49.9985C107.998 49.9985 109.994 52.6188 109.494 70.581C108.994 88.5431 93.5 110.998 88.993 110.998C84.4861 110.998 28.4996 112 28.493 110.455C28.4863 108.91 28.4938 47.5373 28.4938 47.5373L49.9956 32.4996C49.9956 32.4996 53.0332 25.5652 57.9956 8.99958C62.958 -7.56607 78.4744 33.916 66 49.9982M107.498 49.9985C106.998 49.9985 66 49.9982 66 49.9982M107.498 49.9985L66 49.9982" stroke="#606770" stroke-width="10" stroke-linecap="round"/>`

	function replaceLikeSvg(svg, increment) {
		voteContainer.querySelector('.like-icon').innerHTML = svg
		voteContainer.setAttribute('data-isupvoted', !isUpvoted)
		voteContainer.querySelector('.like-count').innerHTML = parseInt(likeCount.innerHTML) + (increment ? 1 : -1)
	}

	let url = `/view/${noteDocID}/vote/feedback?type=upvote${isUpvoted ? '&action=delete' : ''}`
	replaceLikeSvg(isUpvoted ? DISLIKE_SVG : LIKE_SVG, !isUpvoted)

	let voteData = new FormData()
	voteData.append('noteDocID', noteDocID)
	voteData.append('voterStudentID', voterStudentID)
	voteData.append('feedbackDocID', feedbackDocID)

	let response = await fetch(url, {
		method: 'post',
		body: voteData
	})
	let data = await response.json()
	if (!data.ok) {
		Swal.fire(toastData('error', "Yikes! Try again later.", 3000))
	} else {
		voteContainer.removeAttribute('data-disabled')
	}
}


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

const editor = new Quill('#editor', {
  theme: 'snow',
  placeholder: 'Give a feeback'
});
document.getElementById('editor').style.height = '120px';

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

  //CRITICAL: in quick-post, the temporary comment doesn't go away
  // Function to post a main comment
  const pathname = window.location.pathname
  const commenterStudentID = Cookies.get("studentID"); // Commenter's document ID

  const postMainComment = async (event) => {
    event.preventDefault()

    const commentHTML = editor.root.innerHTML; // feedback text
    
    if (editor.root.textContent.trim() === "" || document.querySelector('#editor').getAttribute('data-disabled')) return; // Preventing any empty comments

    document.querySelector('#editor').setAttribute('data-disabled', 'true')

    // a temporary feedback placeholder that will be shown until the main feedback is sent successfully
    manageNotes.addFeedback({
      _id: '__id__',
      createdAt: new Date(),
      feedbackContents: '',
      commenterDocID: {
        profile_pic: '__profile_pic__',
        username: '__username__',
        displayname: 'User'
      },
      noteDocID: {
        _id: '__id__'
      },
      upvoteCount: 0,
      temporary: true
    })

    const feedbackData = new FormData()
    feedbackData.append('noteDocID', noteDocID)
    feedbackData.append('commenterStudentID', commenterStudentID)
    feedbackData.append('feedbackContents', commentHTML)

    let response = await fetch(`/view/${noteDocID}/postFeedback`, {
      body: feedbackData,
      method: 'post'
    })
    let data = await response.json()
    if(data.sent) {
      document.querySelector('#editor').removeAttribute('data-disabled') 
      Swal.fire(toastData('success', "Feedback delivered with care!", 2000))
      editor.root.innerHTML = ''; // reseting toast ui editor content
      adjustThreadLineHeights();
    } else {
      Swal.fire(toastData('error', "Yikes! Try again later.", 3000))
    }

  };

  cmntBtn.addEventListener("click", postMainComment);

  // Function to setup thread reply listeners

  const setupThreadReplyListeners = () => {
    // Use event delegation to handle clicks on the comment list
    commentList.addEventListener('click', async (event) => {
      // Handle opening the thread editor
      if (event.target.classList.contains('thread-opener')) {
        let parentCommenterUsername = event.target.parentElement.parentElement?.querySelector(".reply-info #commenterUsername").textContent
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

          // Append the editor to the thread section
          threadSection.appendChild(threadEditor);
        }

        // Focus on the textarea of the newly created or existing editor
        const textarea = threadEditor.querySelector('.thread-editor');
        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
        textarea.focus();
      }

      // Handle posting replies
      if (event.target.closest('.thread__cmnt-btn')) {
        const textarea = event.target.closest('.thread-editor-container').querySelector('.thread-editor');
        const replyContent = document.querySelector('#mentioneduser').innerHTML + " " + textarea.value.trim();

        if (!textarea.value.trim() || textarea.getAttribute('data-disabled')) return; // Prevents posting empty replies
        
        textarea.setAttribute('data-disabled', 'true')
        const threadSection = event.target.closest('.thread-section');

        manageNotes.addReply(threadSection, {
          createdAt: new Date(),
          feedbackContents: '',
          commenterDocID: {
            profile_pic: '__profile_pic__',
            username: '__username__',
            displayname: 'User'
          },
          temporary: true
        })
        
        const parentFeedbackDocID = threadSection.previousElementSibling.querySelector('.reply-info #parentFeedbackDocID').innerHTML
        const replyData = new FormData()
        replyData.append('noteDocID', noteDocID)
        replyData.append('commenterStudentID', commenterStudentID)
        replyData.append('replyContent', replyContent)
        replyData.append('parentFeedbackDocID', parentFeedbackDocID)
        replyData.append('reply', true)

        let response = await fetch(`/view/${noteDocID}/postFeedback`, {
          body: replyData,
          method: 'post'
        })
        let data = await response.json()
        if (data.sent) {
          textarea.removeAttribute('data-disabled')
          adjustThreadLineHeights(); // Adjust thread height again
          textarea.value = '';
        } else {
          Swal.fire(toastData('error', "Yikes! Try again later.", 3000))    
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
