import { createContext, ReactNode, useEffect, useState } from "react";
import { saveNoteApi } from "../utils/noteActionsApi";
import { SavedNoteObject } from "../types/types";

export const SavedNotesContext = createContext<any>(null)

export function SavedNotesProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [savedNotes, setSavedNotes] = useState<SavedNoteObject[]>([])

    useEffect(() => {
        async function getSavedNotes() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/note?noteType=saved')
                let svNotes = await response.json()
                if (svNotes.objects && svNotes.objects.length !== 0) {
                    setSavedNotes([
                        ...savedNotes,
                        ...svNotes.objects.map((note: any) => {
                            return { noteID: note._id, noteTitle: note.title.length > 30 ? note.title.slice(0, 30) + "..." : note.title }
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
    }, [])

    async function saveNoteFunction(note: any, [isSaveNote, setIsSaveNote]: [boolean, any]) {
        setIsSaveNote((prev: boolean) => !prev)

        let response = await saveNoteApi(note.noteID, isSaveNote)
        if (response.ok) {
            if (isSaveNote) {
                setSavedNotes(savedNotes.filter((_note: SavedNoteObject) => note.noteID !== _note.noteID))
            } else {
                setSavedNotes(prev => [...prev, { noteID: note.noteID, noteTitle: note.noteTitle.length > 30 ? note.noteTitle.slice(0, 30) + "..." : note.noteTitle }])
            }
        }
    }


    return (
        <SavedNotesContext.Provider value={[savedNotes, setSavedNotes, saveNoteFunction]}>
            {children}
        </SavedNotesContext.Provider>
    )
} 