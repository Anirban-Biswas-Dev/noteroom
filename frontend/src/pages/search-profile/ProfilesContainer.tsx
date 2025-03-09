import { useEffect, useState } from "react";
import Profile from "./ProfileCard";
import { ProfileTypes } from "./index";

export default function ProfilesContainer({ 
    sectionLabel, profiles, type_,
    batch: [batch, setBatch], 
    showMoreButton: [showMoreButton, setShowMoreButton], 
    showStatusMessage: [showStatusMessage, setShowStatusMessage]
}: any) {

    const [showContainer, setShowContainer] = useState<boolean>(true)

    useEffect(() => {
        if (type_ === ProfileTypes.SEARCHED_PROFILES) {
            setShowStatusMessage("Start typing to search for people!")
        }
    }, [type_, setShowStatusMessage])

    return (
        <div className="prfls-container">
            <h3 className="section-label" onClick={() => setShowContainer(false)}>{sectionLabel}</h3>
            { profiles?.length !== 0 && <button className="load-more-btn" onClick={() => setShowContainer(prev => !prev)} style={{display: showContainer ? "none" : "flex"}}>
                Expand
                <svg className="chevron-down-icon" width="20" height="10" viewBox="0 0 60 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4.5L30 29.5L55 4.5" stroke="#1E1E1E" strokeWidth="8.33333" strokeLinecap="round"strokeLinejoin="round"/>
                </svg>
            </button>}

            <div className="wrapper" style={{display: showContainer ? "contents" : "none"}}>
                { 
                    profiles?.length > 0 ? 
                        <div className="prfls">
                            { profiles?.map((user: any) => {
                                return <Profile user={user} key={user?.username}></Profile>
                            }) }
                        </div> : 
                        
                        type_ === ProfileTypes.SEARCHED_PROFILES ? <h3>{showStatusMessage}</h3> : null 
                }

                { showMoreButton && <button className="load-more-btn" onClick={() => setBatch((prev: number) => prev + 1)}>
                    See More
                    <svg
                        className="chevron-down-icon"
                        width="20"
                        height="10"
                        viewBox="0 0 60 34"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M5 4.5L30 29.5L55 4.5"
                            stroke="#1E1E1E"
                            stroke-width="8.33333"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </button>}
            </div>
        </div>
    )
}