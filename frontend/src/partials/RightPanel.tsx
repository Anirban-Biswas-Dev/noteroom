import { useContext } from "react";
import { Requests } from ".";
import { UserProfileContext } from "../context/UserProfileContext";

export default function RightPanel({ notiModalState, rightPanelState }: { notiModalState: [any, any ], rightPanelState: boolean }) {
    const [profile, ] = useContext(UserProfileContext)

    return (
        <div className={"right-panel " + (rightPanelState ? "show" : "")}>
            <div className="right-panel-header">
                <svg className="search-prfl-pc" width="45" height="46" viewBox="0 0 54 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M46.0139 46.4844L53 53.4992" stroke="#07192D" strokeWidth="2.48493" />
                    <ellipse cx="23.5019" cy="11.412" rx="10.8672" ry="10.912" fill="#07192D" />
                    <path d="M49.4475 39.4709C49.4475 45.2615 44.7747 49.9417 39.0279 49.9417C33.2811 49.9417 28.6083 45.2615 28.6083 39.4709C28.6083 33.6802 33.2811 29 39.0279 29C44.7747 29 49.4475 33.6802 49.4475 39.4709Z" stroke="#07192D" strokeWidth="4" />
                    <path d="M3.32248 34.8098C9.00331 27.6792 21.1727 27.069 23.5029 28.6011C25.833 30.1332 25.833 30.9126 23.5029 37.9542C21.1727 44.9958 28.1617 47.278 23.5029 47.3074C18.844 47.3367 0.216087 47.3074 0.216087 47.3074C0.216087 47.3074 -1.22218 40.5142 3.32248 34.8098Z" fill="#07192D" />
                </svg>

                <svg className="settings-icon" width="100" height="100" viewBox="0 0 100 100"  fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M38.5417 91.6667L36.875 78.3334C35.9722 77.9862 35.1215 77.5695 34.3229 77.0834C33.5243 76.5973 32.7431 76.0764 31.9792 75.5209L19.5833 80.7292L8.125 60.9375L18.8542 52.8125C18.7847 52.3264 18.75 51.8577 18.75 51.4063V48.5938C18.75 48.1424 18.7847 47.6737 18.8542 47.1875L8.125 39.0625L19.5833 19.2709L31.9792 24.4792C32.7431 23.9237 33.5417 23.4028 34.375 22.9167C35.2083 22.4306 36.0417 22.0139 36.875 21.6667L38.5417 8.33337H61.4583L63.125 21.6667C64.0278 22.0139 64.8785 22.4306 65.6771 22.9167C66.4757 23.4028 67.2569 23.9237 68.0208 24.4792L80.4167 19.2709L91.875 39.0625L81.1458 47.1875C81.2153 47.6737 81.25 48.1424 81.25 48.5938V51.4063C81.25 51.8577 81.1805 52.3264 81.0417 52.8125L91.7708 60.9375L80.3125 80.7292L68.0208 75.5209C67.2569 76.0764 66.4583 76.5973 65.625 77.0834C64.7917 77.5695 63.9583 77.9862 63.125 78.3334L61.4583 91.6667H38.5417ZM50.2083 64.5834C54.2361 64.5834 57.6736 63.1598 60.5208 60.3125C63.3681 57.4653 64.7917 54.0278 64.7917 50C64.7917 45.9723 63.3681 42.5348 60.5208 39.6875C57.6736 36.8403 54.2361 35.4167 50.2083 35.4167C46.1111 35.4167 42.6562 36.8403 39.8438 39.6875C37.0312 42.5348 35.625 45.9723 35.625 50C35.625 54.0278 37.0312 57.4653 39.8438 60.3125C42.6562 63.1598 46.1111 64.5834 50.2083 64.5834Z" fill="#1D1B20"/>
                </svg>
                    
                <svg className="pc-nft-btn"  onClick={() => notiModalState[1](!notiModalState[0])} width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <rect width="40" height="40" fill="url(#pattern0_3781_4906)"/>
                    <defs>
                    <pattern id="pattern0_3781_4906" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use xlinkHref="#image0_3781_4906" transform="scale(0.01)"/>
                    </pattern>
                    <image id="image0_3781_4906" width="100" height="100" xlinkHref="data:image/png;base64,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"/>
                    </defs>
                </svg>
                
                <a href=''><img src={profile.profile_pic} className="profile-pic" id="root-profile-pic"/></a>
            </div>

            <Requests></Requests>

            <div className="right-panel__threads-component">
                <h4 className="threads-component__header-label">Threads</h4>
                <div className="threads-component__subjects">
            
                <div className="threads-component__subject">
                    <p className="threads-component__subject-title">
                    <svg id="icon-lock" width="18" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M29.1667 46.2916V29.4583C29.1667 23.8777 31.3616 18.5257 35.2686 14.5796C39.1756 10.6335 44.4747 8.41663 50 8.41663C55.5253 8.41663 60.8244 10.6335 64.7314 14.5796C68.6384 18.5257 70.8333 23.8777 70.8333 29.4583V46.2916M20.8333 46.2916H79.1667C83.769 46.2916 87.5 50.0599 87.5 54.7083V84.1666C87.5 88.815 83.769 92.5833 79.1667 92.5833H20.8333C16.231 92.5833 12.5 88.815 12.5 84.1666V54.7083C12.5 50.0599 16.231 46.2916 20.8333 46.2916Z" stroke="#ADB5BD" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="15" y="48" width="70" height="43" fill="#ADB5BD"/>
                        </svg>
                        Physics (পদার্থবিজ্ঞান)
                    </p>
                    <ul className="threads-component__chapter-list">
                    <li className="threads-component__chapter-item">
                        <p className="threads-component__chapter-title">
                        <svg width="18" height="20">
                            <use xlinkHref="#icon-lock"></use>
                        </svg> Vector (ভেক্টর)
                        </p>
                    </li>
                    <li className="threads-component__chapter-item">
                        <p className="threads-component__chapter-title">
                        <svg width="18" height="20">
                            <use xlinkHref="#icon-lock"></use>
                        </svg> Motion (গতি)
                        </p>
                    </li>
                    <li className="threads-component__chapter-item">
                        <p className="threads-component__chapter-title">
                        <svg width="18" height="20">
                            <use xlinkHref="#icon-lock"></use>
                        </svg> Newton’s Laws of Motion (নিউটনের গতিসূত্র)
                        </p>
                    </li>
                    <li className="threads-component__chapter-item">
                        <p className="threads-component__chapter-title">
                        <svg width="18" height="20">
                            <use xlinkHref="#icon-lock"></use>
                        </svg> Gravitation (মহাকর্ষ)
                        </p>
                    </li>
                    </ul>
                </div>
            
                <div className="threads-component__subject">
                    <p className="threads-component__subject-title">
                    <svg width="18" height="20">
                            <use xlinkHref="#icon-lock"></use>
                        </svg> Bangla 1st Paper (বাংলা ১ম পত্র)
                    </p>
                    <ul className="threads-component__chapter-list">
                    <li className="threads-component__chapter-item">
                        <p className="threads-component__chapter-title">
                        <svg width="18" height="20">
                            <use xlinkHref="#icon-lock"></use>
                        </svg> অপরিচিতা
                        </p>
                    </li>
                    <li className="threads-component__chapter-item">
                        <p className="threads-component__chapter-title">
                        <svg width="18" height="20">
                            <use xlinkHref="#icon-lock"></use>
                        </svg> Suggestion of সৃজনশীল প্রশ্ন 
                        </p>
                    </li>
                    </ul>
                </div>

                <div className="threads-component__subject">
                    <p className="threads-component__subject-title">
                        <svg width="18" height="20">
                            <use xlinkHref="#icon-lock"></use>
                        </svg> More...
                    </p>
                </div>
            
                </div>
            </div>
        </div>
    )
}