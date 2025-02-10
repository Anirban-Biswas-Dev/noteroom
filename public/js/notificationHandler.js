const ioServer = window.location.origin
const ioSocket = io(ioServer, { query: { studentID: Cookies.get("studentID") } })

let notiEvents = [
    'notification-feedback', 
    'notification-mention', 
    'notification-reply', 
    'notification-upvote', 
    'notification-comment-upvote', 
    'notification-note-upload-success', 
    'notification-note-upload-failure',
    'notification-request',
    'notification-request-done',
    'notification-request-reject'
]

function handleNotifications(events) {
    events.forEach(event => {
        ioSocket.on(event, (data) => {
            addNoti(Object.assign(data, { notiType: event }))
            manageDb.add('notifications', Object.assign(data, { _id: data.notiID }))
            
            const nftShake = document.querySelector('.mobile-nft-btn')
            nftShake.classList.add('shake') 
            setTimeout(() => {
                nftShake.classList.remove('shake');
            }, 300)
            
            try {
                const audio = document.getElementById('notificationAudio');
                audio.play();
            } catch (error) {
                console.error(error)
            }

            if (event === 'notification-request') {
                if (data.additional) {
                    manageDb.add('requests', data.additional)
                }
            }
        })
    })
}

handleNotifications(notiEvents)