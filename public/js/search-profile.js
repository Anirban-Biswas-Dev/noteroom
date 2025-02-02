window.addEventListener('load', async () => { 
    async function fetchRandomProfiles() {
        let response = await fetch('/search-profile/student/random')
        let profiles = await response.json()
        document.querySelector('.profile-loader-random').remove()      
        profiles.forEach(profile => addProfile(profile, 'random-prfls'))
    }

    async function fetchMutualProfiles() {
        let response = await fetch('/search-profile/student/mutual-college')
        let profiles = await response.json()
        document.querySelector('.profile-loader-mtc').remove()      
        if (profiles.length === 0) {
            document.querySelector('.mtc-prfls-container').style.display = 'none'
        } else {
            profiles.forEach(profile => addProfile(profile, 'mtc-prfls'))
        }
    }

    await fetchRandomProfiles()
    await fetchMutualProfiles()
})

function addProfile(student, random) {
    manageNotes.addProfile(student, random)
}

function deleteProfile(studentDocID) {
    let profile = document.querySelector(`#random-${studentDocID}`)
    profile.remove()
}



let searchInput = document.querySelector('input.field')
let searchResultContainer = document.querySelector('.search-result-prfls-container')
let randomProfileContainer = document.querySelectorAll('.random-prfls-container')
let loader = document.querySelector('#searched-profile-loader')
const profileStatus = document.querySelector('.profile-status')

async function search() {
    try {
        let searchTerm = searchInput.value

        if(searchTerm != "") {
            loader.style.display = 'block'
            searchResultContainer.style.display = 'block'
            randomProfileContainer.forEach(container => container.style.display = 'none')

            let profiles = searchResultContainer.querySelectorAll('.results-prfls .results-prfl')
            !profiles.length === 0 || profiles.forEach(profile => profile.remove())

            let response = await fetch(`/api/search/user?term=${searchTerm}`) 
            let students = (await response.json())

            if(students.length !== 0) {        
                loader.style.display = 'none'
                profileStatus.style.display = 'none'

                students.forEach(student => {
                    addProfile(student, 'results-prfls') 
                })
            } else {
                profileStatus.style.display = 'block'
                loader.style.display = 'none'
            }
        }
    } catch (error) {
        console.log(error)
    }
}

searchInput.addEventListener('keydown', (event) => {
    if(event.key === 'Enter') {
        document.querySelector('i.search').click()
    }
})
