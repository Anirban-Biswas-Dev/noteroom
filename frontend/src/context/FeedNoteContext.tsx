import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { FeedNoteObject } from "../types/types";

export enum FeedActions { ADD_NOTES, TOGGLE_SAVE_NOTE, TOGGLE_UPVOTE_NOTE } 
function feedReducer(feedNotes: FeedNoteObject[], actions: { type: FeedActions, payload?: any }) {
    switch(actions.type) {
        case FeedActions.ADD_NOTES:
            return [...feedNotes, ...actions.payload.notes.map((note: any) => new FeedNoteObject(note))]
        case FeedActions.TOGGLE_SAVE_NOTE:
            return feedNotes.map(note => {
                if (note.noteData.noteID === actions.payload.noteID) {
                    return { ...note, interactionData: { ...note.interactionData, isSaved: !note.interactionData.isSaved } }
                }
                return note
            })
        case FeedActions.TOGGLE_UPVOTE_NOTE:
            return feedNotes.map(note => {
                if (note.noteData.noteID === actions.payload.noteID) {
                    return { ...note, interactionData: { ...note.interactionData, isUpvoted: !note.interactionData.isUpvoted, upvoteCount: note.interactionData.upvoteCount + (note.interactionData.isUpvoted ? -1 : +1) } }
                }
                return note
            })
        default:
            return feedNotes
    }
}

export const FeedNoteContext = createContext<any>(null)
export default function FeedNotesProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [feedNotes, dispatch] = useReducer(feedReducer, [])
    const [loading, setLodaing] = useState<boolean>(true)
    const [page, setPage] = useState<number>(1)
    const [hasMore, setHasMore] = useState<boolean>(true)

    const observer = useRef<IntersectionObserver | null>(null)
    
    const lastNoteRef = useCallback((node: any) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(async (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting && hasMore) {
                await fetchNotes()
            }
        })

        if (node) observer.current.observe(node)
    }, [loading])

    async function fetchNotes() {
        setLodaing(true)
        try {
            let response = await fetch(`http://127.0.0.1:2000/api/getnote?type=seg&seed=&page=${page}&count=10`);
            let notes = await response.json()
            if (notes.length !== 0) {
                setLodaing(false)
                dispatch({ type: FeedActions.ADD_NOTES, payload: { notes: notes } })
                setPage(prev => prev + 1)
            } else {
                setLodaing(false)
                setHasMore(false)
                return
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    return (
        <FeedNoteContext.Provider value={{ feedNotes, loading, fetchNotes, lastNoteRef, dispatch, FeedActions }}>
            { children }
        </FeedNoteContext.Provider>
    )
}

export function useFeed() {
    let context = useContext(FeedNoteContext)
    return context
}