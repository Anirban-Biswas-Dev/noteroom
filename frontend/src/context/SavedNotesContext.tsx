import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { SavedNoteObject } from "../types/types";

export const SavedNotesContext = createContext<any>(null)

export function SavedNotesProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [savedNotes, _setSavedNotes] = useState<SavedNoteObject[]>([])
    
    useEffect(() => {
        async function getSavedNotes() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/note?noteType=saved')
                let svNotes = await response.json()
                if (svNotes.objects && svNotes.objects.length !== 0) {
                    _setSavedNotes([
                        ...savedNotes,
                        ...svNotes.objects.map((note: any) => {
                            return { noteID: note._id, noteTitle: note.title.length > 30 ? note.title.slice(0, 30) + "..." : note.title }
                        })
                    ])
                } else {
                    _setSavedNotes([])
                }
            } catch (error) {
                console.error(error)
            }
        }

        getSavedNotes()

    }, [])

    return (
        <SavedNotesContext.Provider value={[savedNotes, _setSavedNotes]}>
            {children}
        </SavedNotesContext.Provider>
    )
} 


export function useSavedNotes() {
    let context = useContext(SavedNotesContext)
    return context
}