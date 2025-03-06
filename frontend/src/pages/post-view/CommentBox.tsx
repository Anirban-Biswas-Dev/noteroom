import { useContext, useState } from "react"
import { CommentsControllerContext } from "./CommentsContainer"

export default function CommentEditor() {
  const {comments: [, setComments]} = useContext(CommentsControllerContext)
  const [commentData, setCommentData] = useState<string>()
  function sendComment() {
    let data = [
      {
          _id: Math.random().toString(),
          noteDocID: "n--no-id--",
          feedbackContents: `<p>${commentData}</p>`,
          docType: "feedbacks",
          commenterDocID: {
              _id: "--no-id--",
              profile_pic: "--no-profilepic--",
              displayname: "Commenter",
              studentID: "--no-studentid--",
              username: "--no-username--"
          },
          replyCount: 0,
          upvoteCount: 0,
          createdAt: "--no-date--",
          __v: 0,
          isUpVoted: false
      },
      []
  ]
    setComments((comments: any) => [...[data], ...comments])
    setCommentData("")
  }

  return (
    <>
      <textarea name="comment-data" value={commentData} onChange={(e) => setCommentData(e.target.value)}></textarea>
      <button onClick={sendComment}>send</button>
    </>
  )
}