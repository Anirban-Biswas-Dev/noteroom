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
        
            status.innerHTML = 'Fetching...'; status.style.display = 'block' 
    
            let response = await fetch(`/search-profile?q=${searchTerm}`) 
            let students = (await response.json()).students 
    
            status.style.display = 'none'
        
            searchContainer.style.display = 'block'
            if(students.length !== 0) {
                randomContainer.style.display = 'none' 
                status.style.display = 'none'
        
                students.forEach(student => {
                    addProfile(student) 
                })
            } else {
                randomContainer.style.display = 'none' 
                status.innerHTML = 'No profiles are here associated with your search!!'
                status.style.display = 'block' 
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
