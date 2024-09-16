// Moshiur I'm providing some codes for the pagination based on what I saw on the public js and server router of loading the notes. But I can't work on it as you've been working on all the things till now I don't have the mental structure on where one operation is working vs another. Here is the code that might give you and idea of how to achieve the basic pagination based on scrolling. 

// Frontend JS (codes for public js of dashbaord)

let currentPage = 1; // Initialize the first page
const limit = 10; // Set a limit of 10 notes per page
let isLoading = false; // Prevent multiple requests during scroll

// Function to load notes based on the current page
async function loadPage(page) {
    isLoading = true; // Set loading to true while the request is being processed

    // Fetch the next set of notes from the backend
    const response = await fetch(`/notes?page=${page}&limit=${limit}`);
    const data = await response.json();

    const notes = data.notes; // The notes data from the server

    // Append new notes to the existing feed
    notes.forEach(note => {
        addNote({
            noteID: note._id,
            thumbnail: note.thumbnail || 'default-thumbnail.jpg', // Assume thumbnail exists or use default
            profile_pic: note.ownerDocID.profile_pic,
            noteTitle: note.title,
            ownerID: note.ownerDocID.studentID,
            ownerDisplayName: note.ownerDocID.displayname
        });
    });

    // If we've fetched fewer than the limit, it means no more notes are left
    if (notes.length < limit) {
        window.removeEventListener('scroll', onScroll); // Stop listening to scroll when all notes are loaded
    }

    isLoading = false; // Reset the loading flag after the notes are appended
}

// Function to add note to the feed (this function should already exist)
function addNote({ noteID, thumbnail, profile_pic, noteTitle, ownerID, ownerDisplayName }) {
    const feedContainer = document.querySelector('.feed-container');
    
    const noteElement = document.createElement('div');
    noteElement.classList.add('note');
    //this one is a short version template string that we're using to keep this readable. Later when adding we can have the the one we have right now.
    noteElement.innerHTML = `
        <div class="note-thumbnail">
            <img src="${thumbnail}" alt="Note Thumbnail">
        </div>
        <div class="note-content">
            <h3>${noteTitle}</h3>
            <p>By ${ownerDisplayName} (${ownerID})</p>
            <img src="${profile_pic}" alt="Owner Profile">
        </div>
    `; 
    feedContainer.appendChild(noteElement); // Add the new note to the feed
}

// Scroll Event Listener
window.addEventListener('scroll', onScroll);

function onScroll() {
    // Calculate the scroll position relative to the document
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100 && !isLoading) {
        currentPage++; // Increment the current page number
        loadPage(currentPage); // Load the next page
    }
}

// Initial load of the first page
loadPage(currentPage);


// Backend Code (server router)

// Adjust the getAllNotes function to support pagination
async function getAllNotes(page = 1, limit = 10) {
    const skip = (page - 1) * limit; // Calculate how many documents to skip
    const notes = await Notes.find({}, { ownerDocID: 1, title: 1, content: 1 })
        .populate('ownerDocID', 'profile_pic displayname studentID') // Populate owner details
        .skip(skip) // Skip the required number of notes
        .limit(limit); // Limit the number of notes returned

    const totalNotes = await Notes.countDocuments(); // Get total notes for pagination
    return { notes, totalNotes };
}

// Route to get paginated notes
router.get('/notes', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default limit of 10 notes per page

    let allNotes = await getAllNotes(page, limit); // Fetch paginated notes
    res.json(allNotes); // Return the notes and total count
});
