export default function NoteSearchBar({ notiModalState }: { notiModalState: [any, any ] }) {
    return (
        <div className="search-container">
            <div className="search-bar-box">
                <div className="search-wraper">
                    <input type="text" className="search-bar" placeholder="Search Notes" />
                    <button className="search-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 30 30">
                            <path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
                        </svg>
                    </button>
                </div>
                <div className="mbl-notification-elements">
                    <svg className="mobile-nft-btn" onClick={() => notiModalState[1](!notiModalState[0])} width="40" height="40" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <rect width="30" height="30" fill="url(#pattern0_1165_1252)" />
                        <defs>
                        <pattern id="pattern0_1165_1252" patternContentUnits="objectBoundingBox" width="1" height="1">
                            <use xlinkHref="#image0_1165_1252" transform="scale(0.01)" />
                        </pattern>
                        <image id="image0_1165_1252" width="100" height="100" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAABNJJREFUeAHtncuLFEccx79rV/UuSlwf/4D4AAkaun41u4sv3IPGi3hbEvAegklMwESFHKInPYkIXlUQER8I4v8QyE0FUcjjkIeYhyaEKPgO1WPNMuMyr+6a6qr+NQwFM9O/qvp8+lc10z1TDfDGBJgAE2ACTIAJMAEmwASYABNgAv0TGNdrIOgrJHQ2fwj9JSamVvcfgN9ZEoF3U0h9ClI9h6TX7Y/8uZOAliVVxmF6EFgEQdfbJXRKodcQ2TUAi3rE4pcLE5B6X08Z81nzUeH6OEAPAon+qW8hifqhRzR+uRABM2HPH/0dc8cCw5Z570S2qlCdvHMXAkJvHViIaGzpEpFfKkRANGaHEDJbqE7euQsBFtIFzqhfGs/WQdKJgTPE7GP25a0MAnoSUn0GoW4PIaJ90hd0E5I+BWaWltGymsWYWYpUHYWkvwuLePtT2SOkdATY8k7NoA7Z3VR9iFTddyCiM2N+Q0ofDNnKOuy2cTlkdsm5iLcz5iKgJ+tAuP8+jtNaCLrnQUYzaxL6Hqle33+DY36n1DOQ9MibjFbGqIeQqhEz6t59k41pSPWPfxmt0y7mQ4Tu3fAY32HOMUn1oEIy7KT/B8yFr3ptsxMQdKuCMppSzHcWzE7Ux4mk05WV0ZpT9Kl6CGmesX1VfSH0CkJtj1zKXFLKaZDWUdyajO34X26ZD10xXwZOaW8AmdEuNeJv82MQdCc4IebEZpTbMNcyRjU09arHzHvRbVKdCy47rKiEzkTmYy6BVH8GK0Sqv4C5JB4pItscrgz7SU7PRCREHwhfCH0RjxCpLkQg5HxMQr6LQMi38QgZxSVZ+4nIVSno13iESPovggz5NyYhLyMQ8jImIe3nh1wNK67jRmPENahRxWch9ktZRUoWUhERNgNZCAtxcwzYIyz00g0dD1FDF2Hb7wGdmypth0Iv3dDxEDV0Ebb9HtC5qdJ2KPTSDR0PUUMXYdvvAZ2bKm2HQi/d0PEQNXQRtv0e0Lmp0nYo9NINHQ9RQxdh2+8BnZsqbYdCL93Q8RA1dBG2/R7QuanSdij00g0dD1FDF2Hb7wGdmypth0Iv3dDxEDV0Ebb9HtC5qdJ2KPTSDR0PUUMXYdvvAZ2bKm2HQi/d0Bl11OmVEfxIrvm7MkyvHDW9cuuT2RQGWda16hkk9C8IdFHNMUj9OSQ9jSY7WgeLet5cAC2Yv0vrSQh9JT4RHT9JSrMbwKYV5Q4pZUczyxsl2Y/Ry5jPlp9h/q5XyU3q/XEOUR2Z0ZJhn1fPYPpeqU3QwfpkhRXRUZp7l1Rjy5ZBqse1F2IYVGLtRtHYyTLeZItQO/wniaBdLMQK0e/7F4J8yHrCUqoyZJlDQqhDtRdSnUn9TZJK+gSSfq+fGLOQp/q4AkPVQk2YS/Lb1pmlVuvwyG/RF9OiNAs55eeYABNgAoETaM5HlyGpyKOmS4i7cN9csL/gahDZlIum1TSmXlzsfJl6Ary3pKbwHHVb0NWhv+OYC2a8lUwg1Rsh1YvBpagXSBsbSm4Nh8sJCPp6YCFCH2Z67giMIdXH+5aSqmMAxtw1hyM3CYyrPV3vWSXUXSS0m3GNlIC50wJty3+Sk9BZmNWnBX2DfFlwPr80UhVcGRNgAkyACTABJsAEmAATYAJBE/gfawhHLlMvr4MAAAAASUVORK5CYII=" />
                        </defs>
                    </svg>

                    <span className="badge-nft" id="notification-count">0</span>
                </div>
                <a href=''><img src="something" className="mbl-profile-pic" /></a>
            </div>
            <div className="results-container">
                <div className="search-results">
                    <div className="status">
                        <div className="search-results-loader"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}