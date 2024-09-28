function showPopup(event) {
    event.preventDefault();
    document.querySelector('.popup').style.display = 'flex';
    document.querySelector('.overlay').style.display = 'flex';
}

function closePopup() {
    document.querySelector('.popup').style.display = 'none';
    document.querySelector('.overlay').style.display = 'none';
}

function goHome() {
    window.location.href = '/dashboard';
}

function autoResize(textarea) {
    textarea.style.height = 'auto'; 
    textarea.style.height = textarea.scrollHeight + 'px'; 
}

function sendMessage() {
    let name = document.querySelector('.user-name').value
    let number = document.querySelector('.contact-details').value
    let collegeID = document.querySelector('.college-id').value
    let message = document.querySelector('.message').value

    let sendMessage = `Name: ${name}\nCollege ID: ${collegeID}\nPhone Number: ${number}\n\n${message}`
    console.log(sendMessage)
}

document.querySelector('.submit-btn').addEventListener('click', sendMessage)