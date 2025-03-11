import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import feedReducer, { FeedActions} from "../reducers/feedReducer";


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

    function upvoteNote(noteID: string) {
        dispatch({ type: FeedActions.TOGGLE_UPVOTE_NOTE, payload: { noteID: noteID } })
    }
    function saveNote(noteID: string) {
        dispatch({ type: FeedActions.TOGGLE_SAVE_NOTE, payload: { noteID: noteID }})
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    return (
        <FeedNoteContext.Provider value={{ feedNotes, loading, fetchNotes, lastNoteRef, dispatch, FeedActions, controller: [upvoteNote, saveNote] }}>
            { children }
        </FeedNoteContext.Provider>
    )
}

export function useFeed() {
    let context = useContext(FeedNoteContext)
    return context
}