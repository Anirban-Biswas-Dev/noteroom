import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { NotificationObject, SavedNoteObject } from "../types/types";

const AppDataContext = createContext<any>(null)
export default function AppDataProvider({ children }: { children: ReactNode | ReactNode[]} ) {
    const [notifs, setNotifs] = useState<NotificationObject[]>([])
    const [savedNotes, setSavedNotes] = useState<SavedNoteObject[]>([])
    const [profile, setProfile] = useState<any>({})

    //TODO: merge the Requests states here


    useEffect(() => {
        async function getNotifs() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/notifs')
                let notifs = await response.json()
                if (notifs.objects && notifs.objects.length !== 0) {
                    setNotifs(notifs.objects.map((noti: any) => new NotificationObject(noti)))
                } else {
                    console.log(`No notifications left`)
                }
            } catch (error) {
                console.log(error)
            }
        }
        getNotifs()
        async function getSavedNotes() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/note?noteType=saved')
                let svNotes = await response.json()
                if (svNotes.objects && svNotes.objects.length !== 0) {
                    setSavedNotes([
                        ...savedNotes,
                        ...svNotes.objects.map((note: any) => {
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
            } catch (error) {
                console.error(error)
            }
        }
        getSavedNotes()


        //FIXME: optimize the profile object and use the metadata in user profile instead of fetching those again
        async function getProfile() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/user/profile')
                let profile = await response.json()
                if (profile.profile) {
                    setProfile(profile.profile)
                } else {
                    setProfile({ })
                }
            } catch (error) {
                console.log(error)
            }
        }

        getProfile()
    }, [])

    return (
        <AppDataContext.Provider value={
            { 
                notification: [notifs, setNotifs],
                savedNotes: [savedNotes, setSavedNotes],
                userProfile: [profile, setProfile]
            }
        }>
            { children }
        </AppDataContext.Provider>
    )
}

export function useAppData() {
    return useContext(AppDataContext)
}