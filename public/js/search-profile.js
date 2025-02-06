window.addEventListener('load', async () => { 
    async function fetchRandomProfiles() {
        let response = await fetch('/search-profile/student/random')
        let profiles = await response.json()
        document.querySelector('.profile-loader-random').style.display = 'none'      
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

document.querySelector('#load-more-random-profiles-btn').addEventListener('click', async function(event) {
    if (event.target.getAttribute('data-disabled')) return
    
    const randomProfileLoader = document.querySelector('.profile-loader-random')
    randomProfileLoader.style.display = 'block'
    event.target.setAttribute('data-disabled', true)

    let prevProfiles = document.querySelector('.random-prfls').querySelectorAll('.results-prfl')
    let prevPrflsUsernames = []
    for (const profile of prevProfiles) {
        prevPrflsUsernames.push(profile.getAttribute('data-username'))
    }
    let response = await fetch(`/search-profile/student/random?exclude=${JSON.stringify(prevPrflsUsernames)}&count=3`)
    let profiles = await response.json()
    if (profiles.length !== 0) {
        profiles.forEach(profile => addProfile(profile, 'random-prfls'))
    }

    randomProfileLoader.style.display = 'none'
    event.target.removeAttribute('data-disabled')
})



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
