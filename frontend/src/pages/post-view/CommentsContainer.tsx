import { ReactNode, useEffect, useState } from "react"
import CommentBox from "./CommentBox"


function Comment({ feedbackData, children }: { feedbackData: any, children: ReactNode | ReactNode[] }) {
    return (
        <div className='main-cmnt-container'>
            <div className="main__author-threadline-wrapper">
                    <img
                        // src={feedbackData?.commenterDocID.profile_pic}
                        src="https://avatar.iran.liara.run/public/8"
                        alt="User Avatar"
                        className="main__cmnt-author-img cmnt-author-img"
                    />
                <div className="thread-line"></div>
            </div>
            <div className="main__cmnts-replies-wrapper">
                <div className="main__body cmnt-body-3rows">
                    <div className="main__reply-info reply-info">
                        <span className="main__author-name">{feedbackData?.commenterDocID.displayname}</span>
                        <span className="reply-date">{feedbackData?.createdAt}</span>
                    </div>
                    <div className="main__reply-msg reply-msg" dangerouslySetInnerHTML={{__html: feedbackData?.feedbackContents}}></div>
                        <div className="main__engagement-opts engagement-opts">
                            <div className="like-wrapper">   
                                <svg className="like-icon" width="20" height="22" viewBox="0 0 115 117" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M107.498 49.9985C107.998 49.9985 109.994 52.6188 109.494 70.581C108.994 88.5431 93.5 110.998 88.993 110.998C84.4861 110.998 28.4996 112 28.493 110.455C28.4863 108.91 28.4938 47.5373 28.4938 47.5373L49.9956 32.4996C49.9956 32.4996 53.0332 25.5652 57.9956 8.99958C62.958 -7.56607 78.4744 33.916 66 49.9982M107.498 49.9985C106.998 49.9985 66 49.9982 66 49.9982M107.498 49.9985L66 49.9982" stroke="#606770" stroke-width="10" stroke-linecap="round"/>
                                </svg>
                                <span className="like-count">{feedbackData?.upvoteCount}</span>
                            </div>
                                
                            <svg 
                                className="reply-icon thread-opener"
                                data-tippy-content="Reply"
                                width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" stroke-width="1.14582" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>                    
                        </div>
                </div>

                <div className="thread-section" id={"thread-" + feedbackData?._id}>
                    { children }
                </div>
            </div>
        </div>
    )
}


function Reply({ replyData }: { replyData: any }) {
    return (
        <div className='thread-msg'>
            <img 
                // src={replyData.commenterDocID.profile_pic} 
                src="https://avatar.iran.liara.run/public/90"
                alt="User Avatar" 
                className="cmnt-author-img thread-avatar" 
            />
            <div className="cmnt-body-3rows">
                <div className="reply-info">
                    <span className="main__author-name" >{replyData?.commenterDocID.displayname}</span>
                    <span className="reply-date">{replyData?.createdAt}</span>
                </div>
                <div className="reply-msg" dangerouslySetInnerHTML={{__html: replyData.feedbackContents }}></div>
                <div className="main__engagement-opts engagement-opts">
                    <svg className="reply-icon thread-opener" data-tippy-content="Reply" width="25" height="24" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.7186 12.9452C18.7186 13.401 18.5375 13.8382 18.2152 14.1605C17.8929 14.4829 17.4557 14.6639 16.9999 14.6639H6.68747L3.25 18.1014V4.35155C3.25 3.89571 3.43108 3.45854 3.75341 3.13622C4.07573 2.81389 4.5129 2.63281 4.96873 2.63281H16.9999C17.4557 2.63281 17.8929 2.81389 18.2152 3.13622C18.5375 3.45854 18.7186 3.89571 18.7186 4.35155V12.9452Z" stroke="#1E1E1E" stroke-width="1.14582" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default function CommentsContainer({ postID }: { postID: any }) {
    const [comments, setComments] = useState<any[]>([
        
    ])

    useEffect(() => {
        async function getComments() {
            try {
                let response = await fetch(`http://127.0.0.1:2000/view/${postID}/comments`)
                let comments = await response.json()
                if (comments && comments.length !== 0) {
                    setComments(prev => [...prev, ...comments])
                } else {
                    setComments([])
                }
            } catch (error) {
                console.error(error)
            }
        }
        getComments()

        comments.map((a: any) => {
            console.log(a)
        })
    }, [])

    return (
        <div className="comment-section">
            <CommentBox></CommentBox>
            {
                comments?.length > 0 ?
                <div className="cmnts-list">
                    { 
                        comments?.map((commentData: any) => {
                            return (
                                <Comment feedbackData={commentData[0]} key={commentData[0]._id}>
                                    {commentData[1] && commentData[1].length > 0 ? commentData[1].map((replyData: any) => {
                                        return <Reply replyData={replyData} key={replyData._id}></Reply> 
                                    }) : ''}
                                </Comment>
                            )
                        })  
                    }
                </div>
                : <div>No Feedbacks yet. Be the first to provide</div>
            }
        </div>
    )
}