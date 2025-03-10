import { useState } from "react";
import FeedNoteMenu from "./NoteMenu";
import RequestModal from "../../partials/RequestModal";
import { Link } from "react-router-dom";
import { FeedNoteEngagement } from "./NoteEngagements";
import { FeedNoteObject } from "../../types/types";

function FeedNoteFirstRow({ note }: { note: FeedNoteObject }) {
  const [showReqModal, setShowReqModal] = useState(false);

  return (
    <>
      <div className="fnc__first-row">
        <div className="fnc__fr-author-img-wrapper">
          <img
            src={note.ownerData.profile_pic}
            className="fnc__fr-author-img"
          />
        </div>
        <div className="fnc__fr-note-info-wrapper">
          <div className="note-info-wrapper--first-row">
            <div className="niw--fr-first-col">
              <div className="niw--fr-first-col-fr">
                <a className="author-prfl-link">
                  {note.ownerData.ownerDisplayName}
                </a>
                {!note.ownerData.isOwner ? (
                  <>
                    <span className="niw--fr-first-col-fr-seperator"></span>
                    <span
                      className="db-note-card-request-option"
                      onClick={() => setShowReqModal(true)}
                    >
                      Request
                    </span>
                  </>
                ) : (
                  ""
                )}
              </div>
              <span className="niw--fr-first-col-note-pub-date">
                {new Date(note.noteData.createdAt).toDateString()}
              </span>
            </div>

            <div className="niw--fr-second-col">
              <FeedNoteMenu note={note}></FeedNoteMenu>
            </div>
          </div>

          <div className="note-info-wrapper--second-row">
            <p className="fnc--note-desc">
              {(function () {
                let body = new DOMParser()
                  .parseFromString(note.noteData.description, "text/html")
                  .querySelector("body");
                let description = body ? body.textContent?.trim() : "";
                let charLimit = note.extras.quickPost ? 250 : 100;
                if (description) {
                  return (
                    <>
                      {description.length >= charLimit ? (
                        <>
                          {description.slice(0, charLimit)}...
                          <span className="note-desc-see-more-btn">
                            Read More
                          </span>
                        </>
                      ) : (
                        description
                      )}
                    </>
                  );
                }
              })()}
            </p>
          </div>
        </div>
      </div>
      {!note.ownerData.isOwner ? (
        <RequestModal
          modalShow={[showReqModal, setShowReqModal]}
          recipientData={{ profile_pic: note.ownerData.profile_pic, displayname: note.ownerData.ownerDisplayName }}
        ></RequestModal>
      ) : (
        ""
      )}
    </>
  );
}

function FeedNoteSecondRow({ note }: { note: FeedNoteObject }) {
  const contentCount = note.contentData.contentCount;
  const isQuickPost = note.extras.quickPost

  return (
    <Link to={`/post/${note.noteData.noteID}`}>
      <div className="fnc__second-row">
        {
          isQuickPost ?
            contentCount !== 0 ?
              <div className="quickpost-thumbnail-wrapper">
                <img className="quickpost-thumbnail" src={note.contentData.content1} />
              </div> : ''
            :
            <div className="thumbnail-grid">
              <img className="thumbnail primary-img" src={note.contentData.content1} />
              <div className="thumbnail-secondary-wrapper">
                <img className="thumbnail secondary-img" src={note.contentData.content2} />
                {contentCount > 2 ? <div className="thumbnail-overlay">+{contentCount - 2}</div> : ''}
              </div>
            </div>
        }

      </div>
    </Link>
  );
}

function FeedNoteThirdRow({ note }: { note: FeedNoteObject }) {
  const upvoteCount = note.interactionData.upvoteCount

  return (
    <div className="fnc__third-row">
      <div className="fnc__tr--note-engagement-metrics">
        <div className="love-react-metric-wrapper">
          <svg
            className="love-react-icon-static"
            width="30"
            height="27"
            viewBox="0 0 30 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
          </svg>
          <span className="love-react-metric-count metric-count-font uv-count">
            {upvoteCount}
          </span>
        </div>

        <div className="review-metric-wrapper">
          <span className="review-count metric-count-font cmnt-count">
            {note.interactionData.feedbackCount} Feedbacks
          </span>
        </div>
      </div>
      <FeedNoteEngagement note={note} ></FeedNoteEngagement>
    </div>
  );
}

export default function FeedNote({ note, ref }: { note: FeedNoteObject, ref?: any }) {
  return (
    <div className="feed-note-card" ref={ref} id={note.noteData.noteID}>
      <FeedNoteFirstRow note={note}></FeedNoteFirstRow>
      <FeedNoteSecondRow note={note}></FeedNoteSecondRow>
      <FeedNoteThirdRow note={note}></FeedNoteThirdRow>
    </div>
  );
}
