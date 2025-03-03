import { ReactNode, use, useContext, useEffect, useState } from "react";
import "../../public/css/note-view.css"
import "../../public/css/loaders.css"
import "../../public/css/nav-section.css"
import "../../public/css/main-pages.css"
import "../../public/css/share-note.css"
import { SavedNotesContext } from "../../context/SavedNotesContext";
import { VoteContext } from "../../context/VoteContext";

export default function PostView() {
    const [noteImages, setNoteImages] = useState<string[]>([])
    const [noteData, setNoteData] = useState<any>()
    const [ownerProfile, setOwnerProfile] = useState<any>()
    const [offset, setOffset] = useState<number>(0)
    const [upvoteCount, setUpvoteCount] = useState<number>(0)
    const [upvote, setUpvote] = useState<boolean>()
    const [isSaveNote, setIsSaveNote] = useState<boolean>(false)
    const [, , saveNoteFunction] = useContext(SavedNotesContext)
    const [upvoteFunction] = useContext(VoteContext)


    const nextImage = () => setOffset(currentIndex => (currentIndex + 1) % noteImages.length)
    const prevImage = () => setOffset(currentIndex => (currentIndex - 1 + noteImages.length) % noteImages.length)
    
    async function upvoteManage() {
        upvoteFunction({noteID: noteData._id, studentID: "9181e241-575c-4ef3-9d3c-2150eac4566d"}, [upvote, setUpvote], [upvoteCount, setUpvoteCount])
    }

    async function saveNote() {
        saveNoteFunction({ noteID: noteData._id, noteTitle: noteData.title }, [isSaveNote, setIsSaveNote])
    }
    
    useEffect(() => {
        async function getNoteData() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/note/67ab79f8f92f27c3f23e3b75/metadata')
                let data = await response.json()
                if (data.ok) {
                    let { note, owner } = data.noteData
                    setNoteData(note)
                    setOwnerProfile(owner)
                    setUpvoteCount(note.upvoteCount)
                    setUpvote(note.isUpvoted)
                    setIsSaveNote(note.isSaved)
                }
            } catch (error) {
                console.error(error)
            }
        }
        getNoteData()

        async function getNoteImages() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/note/67ab79f8f92f27c3f23e3b75/images')
                let data = await response.json()
                if (data.ok && data.images?.length !== 0) {
                    setNoteImages(data.images)
                } else {
                    setNoteImages([])
                }
                // setNoteImages([
                //     'https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                //     'https://images.pexels.com/photos/906150/pexels-photo-906150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                //     'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                //     'https://images.pexels.com/photos/68507/spring-flowers-flowers-collage-floral-68507.jpeg?auto=compress&cs=tinysrgb&w=600',
                //     'https://images.pexels.com/photos/1187079/pexels-photo-1187079.jpeg?auto=compress&cs=tinysrgb&w=600'
                // ])
            } catch (error) {
                console.error(error)
            }
        }
        getNoteImages()
    }, [])

    return (
        <div className="middle-section">
            <div className="nav-section">
                <svg className="nav-back-btn" width="20" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z" fill="#1D1B20"/>
                </svg>
            </div>

            <div className="first-box">
                <div className="fb__col-1">
                    <img className="note-author-img" src={ownerProfile?.profile_pic} alt="Author Picture" />
                    <div className="fb__col-1-wrapper-1">
                        <span className="author-name"><a href="">{ownerProfile?.displayname}</a></span>        
                        <h1 className="section-title">{noteData?.title}</h1>
                    </div>
                </div>

                <div className="fb__col-2">
                    <button className="note-view-request-btn db-note-card-request-option">Request</button>
                    <button className={"save-note-btn " + (isSaveNote ? "saved" : "")} id="save-note-btn" onClick={() => saveNote()}>
                        <svg className="bookmark-fill-white" width="25" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 16.0909V11.0975C21 6.80891 21 4.6646 19.682 3.3323C18.364 2 16.2426 2 12 2C7.75736 2 5.63604 2 4.31802 3.3323C3 4.6646 3 6.80891 3 11.0975V16.0909C3 19.1875 3 20.7358 3.73411 21.4123C4.08421 21.735 4.52615 21.9377 4.99692 21.9915C5.98402 22.1045 7.13673 21.0849 9.44216 19.0458C10.4612 18.1445 10.9708 17.6938 11.5603 17.5751C11.8506 17.5166 12.1494 17.5166 12.4397 17.5751C13.0292 17.6938 13.5388 18.1445 14.5578 19.0458C16.8633 21.0849 18.016 22.1045 19.0031 21.9915C19.4739 21.9377 19.9158 21.735 20.2659 21.4123C21 20.7358 21 19.1875 21 16.0909Z" stroke="#1C274D" stroke-width="1.5"/>
                            <path d="M15 6H9" stroke="#1C274D" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <svg className="bookmark-fill-black" width="25" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M21 11.0975V16.0909C21 19.1875 21 20.7358 20.2659 21.4123C19.9158 21.735 19.4739 21.9377 19.0031 21.9915C18.016 22.1045 16.8633 21.0849 14.5578 19.0458C13.5388 18.1445 13.0292 17.6938 12.4397 17.5751C12.1494 17.5166 11.8506 17.5166 11.5603 17.5751C10.9708 17.6938 10.4612 18.1445 9.44216 19.0458C7.13673 21.0849 5.98402 22.1045 4.99692 21.9915C4.52615 21.9377 4.08421 21.735 3.73411 21.4123C3 20.7358 3 19.1875 3 16.0909V11.0975C3 6.80891 3 4.6646 4.31802 3.3323C5.63604 2 7.75736 2 12 2C16.2426 2 18.364 2 19.682 3.3323C21 4.6646 21 6.80891 21 11.0975ZM8.25 6C8.25 5.58579 8.58579 5.25 9 5.25H15C15.4142 5.25 15.75 5.58579 15.75 6C15.75 6.41421 15.4142 6.75 15 6.75H9C8.58579 6.75 8.25 6.41421 8.25 6Z" fill="#1C274D"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="carousel-container" id="note-image-container">
                <div className="carousel-wrapper" style={{transform: `translateX(${-offset * 100}%)`}}>
                    {noteImages?.map((imageLink: string, index: number) => {
                        return <div className="carousel-slide" key={index}>
                            <div className="carousel-content">
                                <span className="note-page-number">{index + 1}</span>
                                <img src={imageLink} className="image-links" />
                            </div>
                        </div>
                    })}
                </div>

                <button onClick={() => prevImage()} data-tippy-content="Left Arrow (←)" className="carousel-control prev">
                    <svg className="carousel-control-icon" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z" fill="#1D1B20"/>
                    </svg>
                </button>
                <button onClick={() => nextImage()} data-tippy-content="Right Arrow (→)" className="carousel-control next">
                    <svg className="carousel-control-icon" width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M51.3971 38.1667H0.667969V29.8334H51.3971L28.0638 6.50002L34.0013 0.666687L67.3346 34L34.0013 67.3334L28.0638 61.5L51.3971 38.1667Z" fill="#1D1B20"/>
                    </svg>      
                </button>
            </div>

            <div className="third-box">
                <div className="third-box__row-1">
                    <div className="fnc__tr--note-engagement-metrics">
                        <div className="love-react-metric-wrapper">
                            <svg className="love-react-icon-static" width="30" height="27" viewBox="0 0 30 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M27.5227 2.53147C26.7991 1.80756 25.94 1.2333 24.9944 0.841502C24.0489 0.449705 23.0354 0.248047 22.0119 0.248047C20.9883 0.248047 19.9748 0.449705 19.0293 0.841502C18.0837 1.2333 17.2246 1.80756 16.501 2.53147L14.9994 4.03313L13.4977 2.53147C12.0361 1.0699 10.0538 0.248804 7.98685 0.248804C5.91989 0.248804 3.93759 1.0699 2.47602 2.53147C1.01446 3.99303 0.193359 5.97534 0.193359 8.0423C0.193359 10.1093 1.01446 12.0916 2.47602 13.5531L14.9994 26.0765L27.5227 13.5531C28.2466 12.8296 28.8209 11.9705 29.2126 11.0249C29.6044 10.0793 29.8061 9.06582 29.8061 8.0423C29.8061 7.01878 29.6044 6.00528 29.2126 5.05971C28.8209 4.11415 28.2466 3.25504 27.5227 2.53147Z" fill="url(#paint0_linear_4170_1047)" />
                                <defs>
                                    <linearGradient id="paint0_linear_4170_1047" x1="-53.407" y1="-16.9324" x2="14.9989" y2="40.0465" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#04DBF7" />
                                    <stop offset="1" stopColor="#FF0000" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <span className="love-react-metric-count metric-count-font uv-count">{upvoteCount}</span>
                        </div>
                    </div>

                    <div className="note-engagement">
                        <div onClick={() => upvoteManage()} className="uv-container" id="upvote-container" data-isupvoted="<%- note.isUpvoted %>" data-noteid="<%= note._id %>">
                            <svg className="uv-icon" width="18" height="19" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {upvote ? (
                                    <>
                                        <path
                                            d="M27.5227 2.53147C26.7991 1.80756 25.94 1.2333 24.9944 0.841502C24.0489 0.449705 23.0354 0.248047 22.0119 0.248047C20.9883 0.248047 19.9748 0.449705 19.0293 0.841502C18.0837 1.2333 17.2246 1.80756 16.501 2.53147L14.9994 4.03313L13.4977 2.53147C12.0361 1.0699 10.0538 0.248804 7.98685 0.248804C5.91989 0.248804 3.93759 1.0699 2.47602 2.53147C1.01446 3.99303 0.193359 5.97534 0.193359 8.0423C0.193359 10.1093 1.01446 12.0916 2.47602 13.5531L14.9994 26.0765L27.5227 13.5531C28.2466 12.8296 28.8209 11.9705 29.2126 11.0249C29.6044 10.0793 29.8061 9.06582 29.8061 8.0423C29.8061 7.01878 29.6044 6.00528 29.2126 5.05971C28.8209 4.11415 28.2466 3.25504 27.5227 2.53147Z"
                                            fill="url(#paint0_linear_4170_1047)"
                                        />
                                        <defs>
                                            <linearGradient
                                                id="paint0_linear_4170_1047"
                                                x1="-53.407"
                                                y1="-16.9324"
                                                x2="14.9989"
                                                y2="40.0465"
                                                gradientUnits="userSpaceOnUse"
                                            >
                                                <stop stopColor="#04DBF7" />
                                                <stop offset="1" stopColor="#FF0000" />
                                            </linearGradient>
                                        </defs>
                                    </>
                                ) : (
                                    <path
                                        d="M26.0497 5.76283C25.4112 5.12408 24.6532 4.61739 23.8189 4.27168C22.9845 3.92598 22.0903 3.74805 21.1872 3.74805C20.2841 3.74805 19.3898 3.92598 18.5555 4.27168C17.7211 4.61739 16.9631 5.12408 16.3247 5.76283L14.9997 7.08783L13.6747 5.76283C12.385 4.47321 10.636 3.74872 8.81216 3.74872C6.98837 3.74872 5.23928 4.47321 3.94966 5.76283C2.66005 7.05244 1.93555 8.80154 1.93555 10.6253C1.93555 12.4491 2.66005 14.1982 3.94966 15.4878L14.9997 26.5378L26.0497 15.4878C26.6884 14.8494 27.1951 14.0913 27.5408 13.257C27.8865 12.4227 28.0644 11.5284 28.0644 10.6253C28.0644 9.72222 27.8865 8.82796 27.5408 7.99363C27.1951 7.15931 26.6884 6.40127 26.0497 5.76283Z"
                                        stroke="#1E1E1E"
                                        strokeWidth="0.909091"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                )}
                            </svg>
                            <span className="fnc__tr--icon-label like-padding-top-5">Like</span>
                        </div>

                        <svg className="download-icon" width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3,12.3v7a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2v-7" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                            <polyline data-name="Right" fill="none" id="Right-2" points="7.9 12.3 12 16.3 16.1 12.3" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                            <line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="2.7" y2="14.2"/>
                        </svg>

                        <svg className="share-icon" width="40px" height="40px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M19.6495 0.799565C18.4834 -0.72981 16.0093 0.081426 16.0093 1.99313V3.91272C12.2371 3.86807 9.65665 5.16473 7.9378 6.97554C6.10034 8.9113 5.34458 11.3314 5.02788 12.9862C4.86954 13.8135 5.41223 14.4138 5.98257 14.6211C6.52743 14.8191 7.25549 14.7343 7.74136 14.1789C9.12036 12.6027 11.7995 10.4028 16.0093 10.5464V13.0069C16.0093 14.9186 18.4834 15.7298 19.6495 14.2004L23.3933 9.29034C24.2022 8.2294 24.2022 6.7706 23.3933 5.70966L19.6495 0.799565ZM7.48201 11.6095C9.28721 10.0341 11.8785 8.55568 16.0093 8.55568H17.0207C17.5792 8.55568 18.0319 9.00103 18.0319 9.55037L18.0317 13.0069L21.7754 8.09678C22.0451 7.74313 22.0451 7.25687 21.7754 6.90322L18.0317 1.99313V4.90738C18.0317 5.4567 17.579 5.90201 17.0205 5.90201H16.0093C11.4593 5.90201 9.41596 8.33314 9.41596 8.33314C8.47524 9.32418 7.86984 10.502 7.48201 11.6095Z" fill="#0F0F0F"/>
                            <path d="M7 1.00391H4C2.34315 1.00391 1 2.34705 1 4.00391V20.0039C1 21.6608 2.34315 23.0039 4 23.0039H20C21.6569 23.0039 23 21.6608 23 20.0039V17.0039C23 16.4516 22.5523 16.0039 22 16.0039C21.4477 16.0039 21 16.4516 21 17.0039V20.0039C21 20.5562 20.5523 21.0039 20 21.0039H4C3.44772 21.0039 3 20.5562 3 20.0039V4.00391C3 3.45162 3.44772 3.00391 4 3.00391H7C7.55228 3.00391 8 2.55619 8 2.00391C8 1.45162 7.55228 1.00391 7 1.00391Z" fill="#0F0F0F"/>
                        </svg>
                    </div>

                    <h3 className="desc-label">Description</h3>
                </div>
                <div className="desc-content" dangerouslySetInnerHTML={{__html: noteData?.description}}></div>
            </div>
        </div>
    )
}