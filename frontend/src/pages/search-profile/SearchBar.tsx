import { useEffect, useRef, useState } from "react"

export default function SearchBar({ 
    profile: [searchedProfiles, setSearchProfiles], 
    schBatch: [schBatch, setSchBatch], 
    showMoreButton: [showMoreButton, setShowMoreButton], 
    showStatusMessage: [showStatusMessage, setShowStatusMessage] 
}: any) {
    
    const [text, setText] = useState<any>("")
    const totalCount = useRef<number>(-1)
    async function searchProfile(showMore: boolean) {
        try {
            if (text.trim().length !== 0) {
                let response = await fetch(`http://127.0.0.1:2000/api/search?q=${text}&type=profiles&batch=${schBatch}${!showMore ? "&countdoc=true" : ""}`) 
                let data = await response.json()
    
                if (data && data.students.length !== 0) {
                    if (showMore) {
                        setSearchProfiles((prev: any) => [...prev, ...(data.students)])
                    } else {
                        setSearchProfiles(data.students)
                        totalCount.current = data.totalCount
                    }
                } else {
                    setShowStatusMessage("No profiles found!")
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (schBatch !== 1) {
            searchProfile(true)
        }
    }, [schBatch])

    useEffect(() => {
        if (searchedProfiles.length !== 0) {
            setSearchProfiles([])
            setSchBatch(1)
            totalCount.current = -1
        }
        setShowStatusMessage("Start typing to search for people!")
    }, [text])

    useEffect(() => {
        setShowMoreButton(totalCount.current !== -1 && searchedProfiles.length !== totalCount.current)
    }, [searchedProfiles])



    return (
        <div className="prfl-search-container">
            <fieldset className="field-container">
                <input type="text" placeholder="Who are you looking for?" className="field" value={text} onChange={(e) => setText(e.target.value)}/>
                <button className="search-prfl-btn" onClick={() => searchProfile(false)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="20"
                        height="20"
                        viewBox="0 0 30 30"
                    >
                        <path
                            d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"
                        />
                    </svg>
                </button>
            </fieldset>
        </div>
    )
}