function addRandomProfile() {
    /*
    # Process:
    ~ when the page is loaded, some random profiles are added first, which can be removed (deleteProfile)
    */
    let userProfiles = document.querySelectorAll('.random-prfl')
    userProfiles.forEach(profile => {
        let badgeText = profile.querySelector('span.badge').textContent.trim()
        let badgeImage = profile.querySelector('img.user-badge')
        badgeImage.src = imageObject[badgeText]
    })
}
document.addEventListener('DOMContentLoaded', addRandomProfile)

function addProfile(student) {
    manageNotes.addProfile(student)
}

function deleteProfile(studentDocID) {
    let profile = document.querySelector(`#random-${studentDocID}`)
    profile.remove()
}



//* Profile search
let searchInput = document.querySelector('input.field')
async function search() {
    /*
    # Process
    ~   this is more likely note searching. the given text is sent to the server via fetch request (1). the server processes it and returns
    ~   some possible user profiles based on displayname in json format (2). if there are any, then they are added in searched results (3).
    ~   and if this is the first search, the random profiles are being hidden (4). a small status is shown based on some situations (5)
    */
    try {
        let searchTerm = searchInput.value
        if(searchTerm != "") {
            let searchContainer = document.querySelector('.search-result-prfls-container')
            let randomContainer = document.querySelector('.random-prfls-container')
            let status = document.querySelector('.profile-status')
        
            let profiles = document.querySelectorAll('.results-prfls .results-prfl')
        
            if(profiles) {
                profiles.forEach(profile => profile.remove())
            }
        
            status.innerHTML = 'Fetching...'; status.style.display = 'block' // 5
    
            let response = await fetch(`/search-profile?q=${searchTerm}`) // 1
            let students = (await response.json()).students // 2
    
            status.style.display = 'none'
        
            searchContainer.style.display = 'block'
            if(students.length !== 0) {
                randomContainer.style.display = 'none' // 4
                status.style.display = 'none'
        
                students.forEach(student => {
                    addProfile(student) // 3
                })
            } else {
                randomContainer.style.display = 'none' // 4
                status.innerHTML = 'No profiles are here associated with your search!!'
                status.style.display = 'block' // 5
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}
searchInput.addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
        document.querySelector('i.search').click()
    }
})



//* Badge adder in profile cards
const badgeImageObserver = new MutationObserver(entries => {
    /*
    # Process:
    ~   when new profiles are added, both random and searched ones, this observer ditects the profiles' elements. first, captures the added profiles (1)
    ~   then, grab the user's badge (hidden span text) (2) and lastly based on the badge, adds the badge image (3)
    */
    try {
        entries.forEach(entry => {
            let addedProfile = entry.addedNodes[1] // 1
            let badgeText = addedProfile.querySelector('span.badge').textContent.trim() // 2
            let badgeImage = addedProfile.querySelector('img.user-badge')
            badgeImage.src = imageObject[badgeText] // 3
        })
    } catch (error) {
        console.log(error.message)
    }
})
let profiles = document.querySelector('.results-prfls')
badgeImageObserver.observe(profiles, { childList: true })
