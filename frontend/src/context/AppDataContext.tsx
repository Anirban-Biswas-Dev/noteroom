import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { NotificationObject, RequestObject, SavedNoteObject } from "../types/types";

const AppDataContext = createContext<any>(null)
export default function AppDataProvider({ children }: { children: ReactNode | ReactNode[]} ) {
    const [notifs, setNotifs] = useState<NotificationObject[]>([])
    const [savedNotes, setSavedNotes] = useState<SavedNoteObject[]>([])
    const [profile, setProfile] = useState<any>({})
    const [requests, setRequests] = useState<any>()
    const currentUsername = "rafi-rahman-9181e241"

    useEffect(() => {
        async function getNotifs() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/notifications')
                if (response.ok) {
                    let data = await response.json()
                    if (data.ok && data.notifications.length !== 0) {
                        setNotifs(data.notifications.map((noti: any) => new NotificationObject(noti)))
                    } else {
                        setNotifs([])
                    }
                } else {
                    setNotifs([])
                }
            } catch (error) {
                console.error(error)
                setNotifs([])
            }
        }
        getNotifs()
        async function getSavedNotes() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/posts/saved')
                if (response.ok) {
                    let data = await response.json()
                    if (data.ok && data.posts.length !== 0) {
                        setSavedNotes([
                            ...savedNotes,
                            ...data.posts.map((note: any) => {
                                //FIXME: send pre-modified saved notes object just like owned_posts
                                return { 
                                    noteID: note._id, 
                                    noteTitle: note.title.length > 30 ? note.title.slice(0, 30) + "..." : note.title,
                                    noteThumbnail: note.thumbnail
                                }
                            })
                        ])
                    } else {
                        setSavedNotes([])
                    }
                } else {
                    setSavedNotes([])
                }
            } catch (error) {
                setSavedNotes([])
                console.error(error)
            }
        }
        getSavedNotes()


        async function getProfile() {
            try {
                let response = await fetch(`http://127.0.0.1:2000/api/users/${currentUsername}`)
                if (response.ok) {
                    let data = await response.json()
                    if (data.ok && data.profile) {
                        setProfile(data.profile)
                    } else {
                        setProfile({})
                    }
                } else {
                    setProfile({})
                }
            } catch (error) {
                console.log(error)
                setProfile({})
            }
        }

        getProfile()

        async function getRequests() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/requests')
                if (response.ok) {
                    let data = await response.json()
                    if (data.ok && data.requests.length !== 0) {
                        setRequests(data.requests.map((request: any) => new RequestObject(request)))
                    } else {
                        setRequests([])
                    }
                } else {
                    setRequests([])
                }
            } catch (error) {
                console.error(error)
            }
        }

        getRequests()
    }, [])

    return (
        <AppDataContext.Provider value={
            { 
                notification: [notifs, setNotifs],
                savedNotes: [savedNotes, setSavedNotes],
                userProfile: [profile, setProfile, currentUsername],
                requests: [requests, setRequests]
            }
        }>
            { children }
        </AppDataContext.Provider>
    )
}

export function useAppData() {
    return useContext(AppDataContext)
}