import { useEffect, useState } from "react";
import { SavedNoteObject } from "../partials/LeftPanel";

export default function useSavedNotes() {
    const [savedNotes, setSavedNotes] = useState<SavedNoteObject[]>([])

    useEffect(() => {
        async function getSavedNotes() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/note?noteType=saved')
                let svNotes = await response.json()
                if (svNotes.objects && svNotes.objects.length !== 0) {
                    setSavedNotes([...savedNotes, ...svNotes.objects.map((note: any) => new SavedNoteObject(note))])
                } else {
                    setSavedNotes([])
                }
            } catch (error) {
                console.log(error)
            }
        }

        getSavedNotes()
    }, [])

    return [ savedNotes, setSavedNotes ]
}
