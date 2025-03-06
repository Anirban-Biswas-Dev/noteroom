import { useContext, useState } from "react"
import { CommentsControllerContext } from "./CommentsContainer"

export default function ThreadEditor() {
    const [replyData, setReplyData] = useState<string>()
    const { openedThreadID: [openedThreadID, ], comments: [comments, setComments] } = useContext(CommentsControllerContext)

    function sendReply() {
        const threadID = openedThreadID.split("-")[1]
        let data = {
            _id: Math.random().toString(),
            noteDocID: "--no-id--",
            feedbackContents: replyData,
            docType: "replies",
            commenterDocID: {
                _id: "--no-id--",
                profile_pic: "--no-profile--",
                displayname: "Replier",
                studentID: "--no-id--",
                username: "--no-username--"
            },
            parentFeedbackDocID: threadID,
            createdAt: "--no-date--",
            __v: 0
        }
        
        setComments((commentData: any[]) => {
            return commentData.map(comment => {
                if (comment[0]._id === threadID) {
                    return [ comment[0], [ ...comment[1], ...[data] ] ]
                } 
                return comment
            })
        })
    }

    return (
        <>
            <textarea name="reply-data" value={replyData} onChange={(e) => setReplyData(e.target.value)}></textarea>
            <button onClick={sendReply}>send</button>
        </>
    )
}