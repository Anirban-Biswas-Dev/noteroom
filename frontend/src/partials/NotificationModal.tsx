import { useEffect, useState } from "react"
import { NotificationObject } from "../types/types"
import { useAppData } from "../context/AppDataContext"

function Notification({ notiData }: { notiData: NotificationObject }) {
    let isInteraction = notiData.fromUserSudentDocID ? true : false

    return (
        <div className="notification" id={"noti-" + notiData.notiID}>
            <div className="noti__first-col--img-wrapper">
                { isInteraction ? <img src={notiData.fromUserSudentDocID?.profile_pic} alt="notification" className="noti__source-user-img" /> : ''}
            </div>

            <div className="noti__sec-col--msg-wrapper">
                <div className="noti__sc--first-row-msg">
                    <p className={"noti-msg secondary-" + notiData.isRead}>
                        {isInteraction ? <span className="noti-source-user-name">{notiData.fromUserSudentDocID?.displayname}</span> : ''}
                        &nbsp;{notiData.content}
                    </p>
                </div>
                <div className="noti__sc--second-row-noti-info">
                    <span className={"isRead " + notiData.isRead}></span>
                    <span className={"noti-time secondary-" + notiData.isRead}>{(new Date(notiData.createdAt)).toDateString()}</span>
                </div>
            </div>
        </div>
    )
}

export default function NotificationModal({ notiState }: { notiState: [any, any] }) {
    const {notification: [notifs, setNotifs]} = useAppData()

    async function deleteAllNotification() {
        if (notifs.length === 0) return 
        
        let response = await fetch('http://127.0.0.1:2000/api/notifications/delete', { method: 'delete' })
        if (response.ok) {
            let data = await response.json()
            if (data.ok) {
                setNotifs([])
            }
        }
    }

    useEffect(() => {
        window.addEventListener('click', (event) => {
            if ((event.target as Element).getAttribute("class") === "notification-modal-overlay") {
                notiState[1](false)
            }
        })
    }, [])

    return (
        <div className="notification-modal-overlay" style={{display: notiState[0] ? "flex" : "none"}}>
            <div className="notification-modal">
                <div className="notification-header">
                    <h4 className="notification-header-label">Notifications</h4>
                    <svg className="delete-all-noti-icon" onClick={deleteAllNotification} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                        <path d="M 24 4 C 20.491685 4 17.570396 6.6214322 17.080078 10 L 10.238281 10 A 1.50015 1.50015 0 0 0 9.9804688 9.9785156 A 1.50015 1.50015 0 0 0 9.7578125 10 L 6.5 10 A 1.50015 1.50015 0 1 0 6.5 13 L 8.6386719 13 L 11.15625 39.029297 C 11.427329 41.835926 13.811782 44 16.630859 44 L 31.367188 44 C 34.186411 44 36.570826 41.836168 36.841797 39.029297 L 39.361328 13 L 41.5 13 A 1.50015 1.50015 0 1 0 41.5 10 L 38.244141 10 A 1.50015 1.50015 0 0 0 37.763672 10 L 30.919922 10 C 30.429604 6.6214322 27.508315 4 24 4 z M 24 7 C 25.879156 7 27.420767 8.2681608 27.861328 10 L 20.138672 10 C 20.579233 8.2681608 22.120844 7 24 7 z M 11.650391 13 L 36.347656 13 L 33.855469 38.740234 C 33.730439 40.035363 32.667963 41 31.367188 41 L 16.630859 41 C 15.331937 41 14.267499 40.033606 14.142578 38.740234 L 11.650391 13 z M 20.476562 17.978516 A 1.50015 1.50015 0 0 0 19 19.5 L 19 34.5 A 1.50015 1.50015 0 1 0 22 34.5 L 22 19.5 A 1.50015 1.50015 0 0 0 20.476562 17.978516 z M 27.476562 17.978516 A 1.50015 1.50015 0 0 0 26 19.5 L 26 34.5 A 1.50015 1.50015 0 1 0 29 34.5 L 29 19.5 A 1.50015 1.50015 0 0 0 27.476562 17.978516 z"></path>
                    </svg>
                </div>

                <div className="notifications-container">
                    {notifs?.map((noti: any) => {
                        return <Notification notiData={noti} key={noti.notiID}></Notification>
                    })}
                </div>
            </div>
        </div>
    )
}