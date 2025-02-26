import { createContext, ReactNode } from "react";
import useSavedNotes from "../customHooks/useSavedNotes";

export const SavedNotesContext = createContext<any>(null)

export function SavedNotesProvider({ children }: { children: ReactNode[] }) {
    const [savedNotes, setSavedNotes] = useSavedNotes()

    return (
        <SavedNotesContext.Provider value={[savedNotes, setSavedNotes]}>
            { children }
        </SavedNotesContext.Provider>
    )
} 