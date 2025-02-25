import { useState } from "react";
import { FeedNoteObject } from "./FeedSection";

export default function FeedNoteEngagement({ setUpvoteCount, note }: { setUpvoteCount: [any, any], note: FeedNoteObject }) {
  let [upvote, setUpvote] = useState(note.interactionData.isUpvoted);

  function upvoteManage() {
    setUpvote(!upvote);
    setUpvoteCount[1](setUpvoteCount[0] + (!upvote ? +1 : -1));
  }

  return (
    <div className="note-engagement">
      <div className="uv-container" onClick={() => upvoteManage()}>
        <svg
          className="uv-icon"
          width="18"
          height="19"
          viewBox="0 0 22 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
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

      <div className="cmnt-engagement">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="comment-icon"
        >
          <path
            d="M23.25 15.75C23.25 16.413 22.9866 17.0489 22.5178 17.5178C22.0489 17.9866 21.413 18.25 20.75 18.25H5.75L0.75 23.25V3.25C0.75 2.58696 1.01339 1.95107 1.48223 1.48223C1.95107 1.01339 2.58696 0.75 3.25 0.75H20.75C21.413 0.75 22.0489 1.01339 22.5178 1.48223C22.9866 1.95107 23.25 2.58696 23.25 3.25V15.75Z"
            stroke="#1E1E1E"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="fnc__tr--icon-label">Review</span>
      </div>
    </div>
  );
}
