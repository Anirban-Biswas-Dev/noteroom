import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FeedNoteObject } from "../pages/dashboard/FeedSection";

type FeedNoteContextValues = {
    feedNotes: any,
    fetchNotes: any,
    loading: any,
    lastNoteRef: any
}

export const FeedNoteContext = createContext<FeedNoteContextValues | null>(null)

export default function FeedNotesProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [feedNotes, setFeedNotes] = useState<any[]>([])
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
            let response = await fetch(`http://127.0.0.1:2000/api/getnote?type=seg&seed=123123412&page=${page}&count=10`);
            let notes = await response.json()
            if (notes.length !== 0) {
                setLodaing(false)
                setFeedNotes(prev => [...prev, ...notes.map((note: any) => new FeedNoteObject(note))])
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
        <FeedNoteContext.Provider value={{ feedNotes, loading, fetchNotes, lastNoteRef }}>
            { children }
        </FeedNoteContext.Provider>
    )
}

export function useFeed() {
    let context = useContext(FeedNoteContext)
    return context
}