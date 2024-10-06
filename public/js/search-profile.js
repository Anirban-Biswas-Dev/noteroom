let baseURL = 'https://storage.googleapis.com/noteroom-fb1a7.appspot.com/badges/'
let imageObject = {
    'No Badge': `${baseURL}no-badge.png`,
    'Biology': `${baseURL}biology.png`,
    'English': `${baseURL}english.png`
}

function addRandomProfile() {
    let userProfiles = document.querySelectorAll('.random-prfl')
    userProfiles.forEach(profile => {
        let badgeText = profile.querySelector('span.badge').textContent.trim()
        let badgeImage = profile.querySelector('img.user-badge')
        badgeImage.src = imageObject[badgeText]
    })
}
document.addEventListener('DOMContentLoaded', addRandomProfile)

function addProfile(student) {
    let profileCard = `
                    <div class="results-prfl">
                        <img src="${student.profile_pic}" alt="Profile Pic" class="prfl-pic">
                        <span class="prfl-name" onclick="window.location.href = '/user/${student.studentID}'">${student.displayname}</span>
                        <span class="prfl-desc">${student.bio}</span>
                        <span class="badge" style="display: none;">${student.badge}</span>
                        <img src="" alt="" class="user-badge">
                    </div>`
    document.querySelector('.results-prfls').insertAdjacentHTML('beforeend', profileCard);
}

let searchInput = document.querySelector('input.field')
async function search() {
    try {
        let searchTerm = searchInput.value
        if(searchTerm != "") {
            let searchContainer = document.querySelector('.search-result-prfls-container')
            let randomContainer = document.querySelector('.random-prfls-container')
            let status = document.querySelector('.status')
        
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

function deleteProfile(studentDocID) {
    let profile = document.querySelector(`#random-${studentDocID}`)
    profile.remove()
}

const badgeImageObserver = new MutationObserver(entries => {
    try {
        entries.forEach(entry => {
            let addedProfile = entry.addedNodes[1]
            let badgeText = addedProfile.querySelector('span.badge').textContent.trim()
            let badgeImage = addedProfile.querySelector('img.user-badge')
            badgeImage.src = imageObject[badgeText]
        })
    } catch (error) {
        console.log(error.message)
    }
})
let profiles = document.querySelector('.results-prfls')
badgeImageObserver.observe(profiles, { childList: true })