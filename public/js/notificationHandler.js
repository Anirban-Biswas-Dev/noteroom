const ioServer = window.location.origin
const ioSocket = io(ioServer, { query: { studentID: Cookies.get("studentID") } })


ioSocket.on('notification-feedback', (feedbackData, message) => {
    addNoti(feedbackData, message)
    manageDb.add('notis', feedbackData)

    const nftShake = document.querySelector('.mobile-nft-btn')
    nftShake.classList.add('shake') // 4
    setTimeout(() => {
        nftShake.classList.remove('shake');
    }, 300)

    try {
        const audio = document.getElementById('notificationAudio');
        audio.play();
    } catch (error) {
        console.error(error)
    }
})

ioSocket.on("notification-mention", (mentionData, message) => {
    addNoti(mentionData, message)
    manageDb.add('notis', mentionData)

    const nftShake = document.querySelector('.mobile-nft-btn')
    nftShake.classList.add('shake') // 4
    setTimeout(() => {
        nftShake.classList.remove('shake');
    }, 300)

    try {
        const audio = document.getElementById('notificationAudio');
        audio.play();
    } catch (error) {
        console.error(error)
    }
})

ioSocket.on("notification-reply", (replyData, message) => {
    addNoti(replyData, message)
    manageDb.add('notis', replyData)

    const nftShake = document.querySelector('.mobile-nft-btn')
    nftShake.classList.add('shake') // 4
    setTimeout(() => {
        nftShake.classList.remove('shake');
    }, 300)

    try {
        const audio = document.getElementById('notificationAudio');
        audio.play();
    } catch (error) {
        console.error(error)
    }
})

ioSocket.on("notification-upvote", (voteData, message) => {
    addNoti(voteData, message)
    manageDb.add('notis', voteData)

    const nftShake = document.querySelector('.mobile-nft-btn')
    nftShake.classList.add('shake') // 4
    setTimeout(() => {
        nftShake.classList.remove('shake');
    }, 300)

    try {
        const audio = document.getElementById('notificationAudio');
        audio.play();
    } catch (error) {
        console.error(error)
    }
})

ioSocket.on('notification-comment-upvote', (voteData, message) => {
    addNoti(voteData, message)
    manageDb.add('notis', voteData)

    const nftShake = document.querySelector('.mobile-nft-btn')
    nftShake.classList.add('shake') // 4
    setTimeout(() => {
        nftShake.classList.remove('shake');
    }, 300)

    try {
        const audio = document.getElementById('notificationAudio');
        audio.play();
    } catch (error) {
        console.error(error)
    }
})