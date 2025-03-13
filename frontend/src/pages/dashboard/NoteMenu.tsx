import { useState } from "react";
import ShareModal from "../../partials/ShareModal";
import { FeedNoteObject } from "../../types/types";
import { useFeed } from "../../context/FeedNoteContext";

export default function FeedNoteMenu({ note }: { note: FeedNoteObject }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { controller: [, saveNote] } = useFeed()
  const isSaveNote = note.interactionData.isSaved

  return (
    <div className="note-menu">
      <button className="note-menu-btn" onClick={() => setShowMenu(!showMenu)}>
        <svg
          width="25"
          height="105"
          className="note-menu-eclipse-icon"
          viewBox="0 0 25 105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="25" height="25" rx="12.5" fill="black" />
          <rect y="40" width="25" height="25" rx="12.5" fill="black" />
          <rect y="80" width="25" height="25" rx="12.5" fill="black" />
        </svg>
      </button>
      <div className={"menu-options " + (showMenu ? "active" : "")}>
        { note.isQuickPost || <>
          <div
            className="option svn-btn-parent"
            onClick={() => saveNote({ noteID: note?.noteData.noteID, noteTitle: note?.noteData.noteTitle, noteThumbnail: note?.contentData.content1}, isSaveNote)}
          >
            <button
              className={"save-note-btn " + (isSaveNote ? "saved" : "")}
              id="save-note-btn"
            >
              <svg
                className="bookmark-fill-white"
                width="28"
                height="40"
                viewBox="0 0 66 97"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.619048 96C0.619048 96.1528 0.710359 96.2908 0.850996 96.3506C0.991633 96.4104 1.15437 96.3803 1.26439 96.2743L32.2955 66.3606C32.7036 65.9672 33.2964 65.9672 33.7045 66.3606L64.7356 96.2743C64.8456 96.3803 65.0084 96.4104 65.149 96.3506C65.2896 96.2908 65.381 96.1528 65.381 96V4.27586C65.381 2.2943 63.924 0.619048 62.0462 0.619048H3.95385C2.07596 0.619048 0.619048 2.2943 0.619048 4.27586V96ZM3.95385 3.56486H62.0462C62.3434 3.56486 62.6498 3.84515 62.6498 4.27586V90.3117L35.5252 64.1638C34.0811 62.7717 31.9189 62.7717 30.4748 64.1638L3.35018 90.3117V4.27586C3.35018 3.84515 3.65658 3.56486 3.95385 3.56486Z"
                  fill="black"
                  stroke="black"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                className="bookmark-fill-black"
                width="28"
                height="40"
                viewBox="0 0 66 97"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 3C0 1.34314 1.34315 0 3 0H63C64.6569 0 66 1.34315 66 3V93.9494C66 96.5944 62.8256 97.9451 60.9198 96.111L35.0802 71.2442C33.9187 70.1264 32.0813 70.1264 30.9198 71.2442L5.08024 96.111C3.17437 97.9451 0 96.5944 0 93.9494V3Z"
                  fill="black"
                />
              </svg>
            </button>
            <span className="opt-label">Save Note</span>
          </div>

          <div className="option">
            <svg
              width="40"
              height="40"
              viewBox="0 0 43 43"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M37.1541 26.5395V33.6165C37.1541 34.555 36.7813 35.455 36.1177 36.1186C35.4541 36.7822 34.5541 37.155 33.6156 37.155H8.84623C7.90776 37.155 7.00773 36.7822 6.34414 36.1186C5.68054 35.455 5.30774 34.555 5.30774 33.6165V26.5395M12.3847 17.6933L21.2309 26.5395M21.2309 26.5395L30.0771 17.6933M21.2309 26.5395V5.30859"
                stroke="#1E1E1E"
                strokeWidth="2.29523"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="opt-label">Download</span>
          </div>
        </>}

        <div
          className="option"
          onClick={() => setShowShareModal(prev => !prev)}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 46 46"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30.6079 32.5223L27.8819 29.8441L36.6816 21.0444L27.8819 12.2446L30.6079 9.56641L42.0858 21.0444L30.6079 32.5223ZM3.82599 36.3483V28.6963C3.82599 26.05 4.7506 23.8023 6.59983 21.953C8.48094 20.0719 10.7446 19.1314 13.391 19.1314H25.2037L18.3169 12.2446L21.0429 9.56641L32.5209 21.0444L21.0429 32.5223L18.3169 29.8441L25.2037 22.9574H13.391C11.7968 22.9574 10.4418 23.5153 9.32584 24.6312C8.20993 25.7471 7.65197 27.1022 7.65197 28.6963V36.3483H3.82599Z"
              fill="#1D1B20"
            />
          </svg>
          <span className="opt-label">Share</span>
        </div>
      
        
      </div>

      <ShareModal showState={[showShareModal, setShowShareModal]} noteLink={`/post/${note.noteData.noteID}`}></ShareModal>
    </div>
  );
}
