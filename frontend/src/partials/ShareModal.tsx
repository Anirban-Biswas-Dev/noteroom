import { useEffect, useState } from "react"

export default function ShareModal({ showState, noteLink }: { showState: [any, any], noteLink: string }) {
    const [showCopyMsg, setShowCopyMsg] = useState(false)

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(noteLink)
            setShowCopyMsg(true)
        } catch (error) {}
    }

    useEffect(() => {
        if (showCopyMsg) {
            setTimeout(() => {
                setShowCopyMsg(false)
            }, 2000)
        }
    }, [showCopyMsg])

    return (
        <div className={"share-note-overlay " + "visible"} style={{display: showState[0] ? 'flex' : 'none'}}>
            <div className="share-note-modal">
                <div className="modal-header">
                    <h3>Share on</h3>
                    <span className="close-share-note-modal" onClick={() => showState[1](false)}>&times;</span>
                </div>

                <div className="platforms-section">
                    <div className="plf-box">
                        <svg className="social-share-icons" width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_4711_6579)">
                            <path d="M50 0C22.386 0 0 22.386 0 50C0 73.448 16.144 93.124 37.922 98.528V65.28H27.612V50H37.922V43.416C37.922 26.398 45.624 18.51 62.332 18.51C65.5 18.51 70.966 19.132 73.202 19.752V33.602C72.022 33.478 69.972 33.416 67.426 33.416C59.228 33.416 56.06 36.522 56.06 44.596V50H72.392L69.586 65.28H56.06V99.634C80.818 96.644 100.002 75.564 100.002 50C100 22.386 77.614 0 50 0Z" fill="black"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_4711_6579">
                            <rect width="100" height="100" fill="white"/>
                            </clipPath>
                            </defs>
                        </svg>
                        <span className="plf-label">Facebook</span>
                    </div>
                    <div className="plf-box">
                        <svg width="50" height="50" className="social-share-icons" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 99.9999L7.02916 74.3207C2.69166 66.8041 0.4125 58.2833 0.416666 49.5458C0.429166 22.2291 22.6583 0 49.9708 0C63.2249 0.00416666 75.6666 5.16666 85.0249 14.5333C94.3791 23.9 99.5291 36.35 99.5249 49.5916C99.5124 76.9124 77.2832 99.1416 49.9708 99.1416C41.6791 99.1374 33.5083 97.0582 26.2708 93.1082L0 99.9999ZM27.4875 84.1374C34.4708 88.2832 41.1374 90.7666 49.9541 90.7707C72.6541 90.7707 91.1457 72.2957 91.1582 49.5833C91.1666 26.825 72.7624 8.37499 49.9874 8.36666C27.2708 8.36666 8.79166 26.8416 8.78332 49.5499C8.77916 58.8208 11.4958 65.7624 16.0583 73.0249L11.8958 88.2249L27.4875 84.1374ZM74.9333 61.3708C74.6249 60.8541 73.7999 60.5458 72.5583 59.9249C71.3208 59.3041 65.2333 56.3083 64.0958 55.8958C62.9624 55.4833 62.1374 55.2749 61.3083 56.5166C60.4833 57.7541 58.1083 60.5458 57.3874 61.3708C56.6666 62.1958 55.9416 62.2999 54.7041 61.6791C53.4666 61.0583 49.4749 59.7541 44.7458 55.5333C41.0666 52.2499 38.5791 48.1958 37.8583 46.9541C37.1375 45.7166 37.7833 45.0458 38.4 44.4291C38.9583 43.875 39.6375 42.9833 40.2583 42.2583C40.8875 41.5416 41.0916 41.025 41.5083 40.1958C41.9208 39.3708 41.7166 38.6458 41.4041 38.025C41.0916 37.4083 38.6166 31.3125 37.5875 28.8333C36.5791 26.4208 35.5583 26.7458 34.8 26.7083L32.425 26.6666C31.6 26.6666 30.2583 26.975 29.125 28.2166C27.9916 29.4583 24.7916 32.45 24.7916 38.5458C24.7916 44.6416 29.2291 50.5291 29.8458 51.3541C30.4666 52.1791 38.575 64.6874 50.9958 70.0499C53.9499 71.3249 56.2583 72.0874 58.0541 72.6582C61.0208 73.5999 63.7208 73.4666 65.8541 73.1499C68.2333 72.7957 73.1791 70.1541 74.2124 67.2624C75.2458 64.3666 75.2458 61.8874 74.9333 61.3708Z" fill="black"/>
                        </svg>
                        
                        <span className="plf-label">WhatsApp</span>
                    </div>
                </div>

                <div className="copy-link-title">
                    <h4>Or copy Link</h4>
                    <div className={"successful-copy " + (showCopyMsg ? "s-c-effect" : "")} style={{display: (showCopyMsg ? 'flex' : 'none')}}>
                        <svg width="20" height="20" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_1844_2149)">
                            <path d="M14.0001 0C6.28041 0 0 6.28031 0 13.9999C0 21.7195 6.28041 27.9998 14.0001 27.9998C21.7197 27.9998 28 21.7195 28 13.9999C28 6.28031 21.7197 0 14.0001 0ZM14.0001 25.7047C7.5459 25.7047 2.29507 20.4541 2.29507 13.9999C2.29507 7.54581 7.5459 2.29507 14.0001 2.29507C20.4542 2.29507 25.7049 7.54581 25.7049 13.9999C25.7049 20.4541 20.4542 25.7047 14.0001 25.7047Z" fill="#1D8102" />
                            <path d="M20.0564 8.62512L11.744 16.9376L7.94357 13.1371C7.49539 12.689 6.76887 12.689 6.32069 13.1371C5.8726 13.5853 5.8726 14.3118 6.32069 14.76L10.9326 19.3719C11.1567 19.5959 11.4503 19.708 11.744 19.708C12.0377 19.708 12.3314 19.5959 12.5555 19.3719L21.6793 10.2481C22.1274 9.79992 22.1274 9.07339 21.6793 8.62521C21.2311 8.17703 20.5045 8.17703 20.0564 8.62512Z" fill="#1D8102" />
                        </g>
                        <defs>
                            <clipPath id="clip0_1844_2149">
                            <rect width="28" height="28" fill="white" />
                            </clipPath>
                        </defs>
                        </svg>
                        <span>Link Copied!</span>
                    </div>
                </div>

                <div className="page-link-section">
                    <div className="link-box">
                        <p className="_link_">{window.location.origin + noteLink}</p>
                        <button className="copy-link-btn" onClick={() => copyLink()}>
                        <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.832 62.5H16.6654C14.4552 62.5 12.3356 61.622 10.7728 60.0592C9.21 58.4964 8.33203 56.3768 8.33203 54.1666V16.6666C8.33203 14.4565 9.21 12.3369 10.7728 10.7741C12.3356 9.21129 14.4552 8.33331 16.6654 8.33331H54.1654C56.3755 8.33331 58.4951 9.21129 60.0579 10.7741C61.6207 12.3369 62.4987 14.4565 62.4987 16.6666V20.8333M45.832 37.5H83.332C87.9344 37.5 91.6654 41.2309 91.6654 45.8333V83.3333C91.6654 87.9357 87.9344 91.6666 83.332 91.6666H45.832C41.2297 91.6666 37.4987 87.9357 37.4987 83.3333V45.8333C37.4987 41.2309 41.2297 37.5 45.832 37.5Z" stroke="#1E1E1E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}