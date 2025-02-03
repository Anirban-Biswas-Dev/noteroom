
// Main Initialization Function
function initializeRequestHandlers() {
    console.log("Initializing Request Handlers...");

    setupRequestModal();
}

let recUsername = ''
// Modal Setup Function with Event Delegation
function setupRequestModal() {
    console.log("Setting up Request Modal...");

    const modalOverlay = document.querySelector(".request-modal-overlay");
    const textarea = document.querySelector(".request-modal__sr--input");
    const charCountDisplay = document.querySelector(".request-modal__sr--char-count");
    const sendButton = document.querySelector(".request-modal__tr--send-req-btn");
    const maxChars = 170;

    console.log(`Modal Overlay: ${modalOverlay ? "Found" : "Not Found"}`);

    // Event Delegation for Request Triggers
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("db-note-card-request-option")) {

            let recProfilePic = event.target.getAttribute("data-req-pfp");
            let recDisplayname = event.target.getAttribute("data-req-dn");
            recUsername = event.target.getAttribute("data-req-un");

            document.querySelector('#request-rec-pfp').src = recProfilePic; 
            document.querySelector('#request-rec-dn').textContent = recDisplayname;

            modalOverlay.style.display = "flex";
            textarea.value = "";
            charCountDisplay.textContent = `${maxChars} characters remaining`;
            sendButton.disabled = true;
        }
    });

    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            console.log("Closing modal");
            modalOverlay.style.display = "none";
        }
    });

    // Character counter
    textarea.addEventListener("input", () => {
        console.log("Textarea input detected");

        let remaining = maxChars - textarea.value.length;
        if (remaining < 0) {
            textarea.value = textarea.value.substring(0, maxChars);
            remaining = 0;
        }

        charCountDisplay.textContent = `${remaining}/170`;
        sendButton.disabled = textarea.value.trim().length === 0;
    });

    // Ctrl + Enter shortcut
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "Enter" && modalOverlay.style.display === "flex") {
            console.log("Ctrl + Enter detected");
            sendRequest(textarea, modalOverlay);
        }
    });

    // Send button click
    sendButton.addEventListener("click", () => {
        console.log("Send button clicked");
        sendRequest(textarea, modalOverlay);
    });
}

// Send Request Function
async function sendRequest(textarea, modalOverlay) {
    const message = textarea.value.trim();
    if (!message) return

    let requestData = new FormData()
    requestData.append('recUsername', recUsername)
    requestData.append('message', message)
    
    let response = await fetch('/api/request/send', {
        method: 'POST',
        body: requestData
    })
    let data = await response.json()
    console.log(data)

    modalOverlay.style.display = "none";
}

// DOM Content Loaded Initialization
document.addEventListener("DOMContentLoaded", initializeRequestHandlers);
