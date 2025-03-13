import { useEffect, useState } from "react";

export default function RequestModal({ modalShow, recipientData }: any) {
  const MAX_MESSAGE_LENGTH = 170;
  const [reqMsg, setReqMsg] = useState("");
  const [charCounter, setCharCounter] = useState(0);
  const [isDisabled, setIsDisabled] = useState(true);

  //TODO: fix the character resistence
  function writeRequest(e: any) {
    setReqMsg(e.target.value);
    let charLength = e.target.value.length;
    setCharCounter(
      charLength <= MAX_MESSAGE_LENGTH ? charLength : MAX_MESSAGE_LENGTH + 1
    );
  }

  useEffect(() => {
    setIsDisabled(charCounter === 0 || charCounter === MAX_MESSAGE_LENGTH + 1);
  }, [charCounter]);

  return (
    <div
      className="request-modal-overlay"
      style={{ display: modalShow[0] ? "flex" : "none" }}
    >
      <div className="request-modal">
        <div className="request-modal__fr">
          <div className="modal-header">
            <span
              className="close-share-note-modal"
              onClick={() => modalShow[1](false)}
            >
              &times;
            </span>
          </div>
          <span className="request-modal__fr--requested-label">To:</span>
          <img
            src={recipientData.profile_pic}
            alt="UserName"
            className="request-modal__fr-requested-userpic"
            id="request-rec-pfp"
          />
          <span
            className="request-modal__fr--requested-username"
            id="request-rec-dn"
          >
            {recipientData.displayname}
          </span>
        </div>
        <div className="request-modal__sr">
          <textarea
            name="Request Description"
            placeholder="Briefly describe what you need"
            className="request-modal__sr--input"
            onChange={(e) => writeRequest(e)}
            value={reqMsg}
          ></textarea>
          <span className="request-modal__sr--char-count">
            {charCounter <= MAX_MESSAGE_LENGTH
              ? charCounter
              : MAX_MESSAGE_LENGTH}
            /{MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <div className="request-modal__tr">
          <button
            className="request-modal__tr--send-req-btn"
            disabled={isDisabled}
          >
            Request
          </button>
        </div>
      </div>
    </div>
  );
}
