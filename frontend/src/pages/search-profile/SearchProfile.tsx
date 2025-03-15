import SearchBar from "./SearchBar";
import '../../public/css/search-profile.css'
import ProfiesContainer from "./ProfilesContainer";
import { useEffect, useRef, useState } from "react";
import { ProfileTypes } from "./index";

export default function SearchProfile() {
    const [mutualCollegeProfiles, setMututalCollegeProfiles] = useState<any[]>([])
    const [searchedProfiles, setSearchedProfiles] = useState<any[]>([])

    const [mtcBatch, setMtcBatch] = useState<number>(1)
    const [schBatch, setSchBatch] = useState<number>(1)

    const [showSchMoreButton, setShowSchMoreButton] = useState<boolean>(false)
    const [showMtcMoreButton, setShowMtcMoreButton] = useState<boolean>(true)
    const [showStatusMessage, setShowStatusMessage] = useState<string | null>(null)

    const totalMtcCount = useRef<number>(-1)

    async function getMtcProfiles(showMore: boolean) {
        try {
            let response = await fetch(`http://127.0.0.1:2000/api/users/mutual-college?batch=${mtcBatch}${!showMore ? "&countdoc=true" : ""}`)
            let data = await response.json()
            if (data && data.students.length !== 0) {
                if (showMore) {
                    setMututalCollegeProfiles((prev: any) => [...prev, ...data.students])
                } else {
                    setMututalCollegeProfiles(data.students)
                    totalMtcCount.current = data.totalCount
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        getMtcProfiles(false)
    }, [])

    useEffect(() => {
        if (mtcBatch !== 1) {
            getMtcProfiles(true)
        }
        setShowMtcMoreButton(totalMtcCount.current !== mutualCollegeProfiles.length)
    }, [mtcBatch])

    

    return (
        <div className="middle-section">
            <div className="nav-section">
                <svg
                    className="nav-back-btn"
                    width="20"
                    viewBox="0 0 68 68"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z"
                        fill="#1D1B20"
                    />
                </svg>
            </div>

            <SearchBar 
                profile={[searchedProfiles, setSearchedProfiles]} 
                schBatch={[schBatch, setSchBatch]}
                showMoreButton={[showSchMoreButton, setShowSchMoreButton]}
                showStatusMessage={[showStatusMessage, setShowStatusMessage]}
            />
            <ProfiesContainer 
                sectionLabel={"Search Results"} 
                profiles={searchedProfiles} 
                batch={[schBatch, setSchBatch]} 
                showMoreButton={[showSchMoreButton, setShowSchMoreButton]}
                showStatusMessage={[showStatusMessage, setShowStatusMessage]}
                type_={ProfileTypes.SEARCHED_PROFILES}
            /> 

            { mutualCollegeProfiles.length !== 0 && <ProfiesContainer 
                sectionLabel={"Mutual College"} 
                profiles={mutualCollegeProfiles} 
                batch={[mtcBatch, setMtcBatch]} 
                showMoreButton={[showMtcMoreButton, setShowMtcMoreButton]}
                showStatusMessage={[showStatusMessage, setShowStatusMessage]}
                type_={ProfileTypes.MUTUAL_COLLEGE_PROFILES}
            /> }
        </div>
    )
}