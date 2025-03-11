import { useState } from "react";
import "../../public/css/user-profile.css"

export default function UserProfile() {
  const [visiting, setVisiting] = useState(false); // Simulating visiting mode
  const [user, setUser] = useState({
    profilePic: ".\sample-profile-pic.jpg",
    displayName: "UserName",
    group: "User Group",
    badgeLogo: ".\sample-badge-logo.png",
    badgeText: "Physics Top Voice",
    featuredNotesCount: 0,
    collegeID: "Chittagong College",
    bio: "This is a sample bio.",
    collegeYear: "Not Provided",
    rollNumber: "Not Provided",
    favouriteSubject: "Mathematics",
    notFavSubject: "Bangla",
    username: "username123",
  });

  return (
    <div className="middle-section">
      <div className="nav-section">
        <svg
          className="nav-back-btn"
          onClick={() => console.log("Go Back")}
          width="20"
          height="auto"
          viewBox="0 0 68 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z"
            fill="#1D1B20"
          />
        </svg>
      </div>
      <div className="ms-first-row">
        <div className="user-prfl-pic-wrapper">
          <img
            className="user-prfl-pic"
            src={user.profilePic}
            alt="Profile Picture"
            onClick={() => console.log("Change Profile Picture")}
          />
        </div>
        <div className="info-items">
          <span className="display-name">{user.displayName}</span>
          <div className="user-group">{user.group}</div>
          <div className="user-gains">
            <div className="badge">
              <img
                className="badge-logo"
                src={`/images/badges/${user.badgeLogo}`}
                alt="Badge"
              />
              <div className="top-voice-badge">{user.badgeText}</div>
            </div>
            {user.featuredNotesCount > 0 ? (
              <div className="featured-note">
                Featured Notes ({user.featuredNotesCount})
              </div>
            ) : (
              <div className="no-featured-note">No Featured Notes</div>
            )}
          </div>
        </div>
        <div className="user-profile-interaction-container">
          {visiting && (
            <button className="user-profile-request-btn">Request</button>
          )}
          <svg
            className="share-user-profile"
            width="28"
            height="28"
            fill="none"
          >
            <rect width="28" height="28" />
          </svg>
        </div>
      </div>
      <div className="ms-personal-info-container">
        <div className="p-info__first-row">
          <span className="input-label">College</span>
          <p className="user-info-text" id="college-name">
            {user.collegeID}
          </p>
        </div>
        <div className="p-info__second-row">
          <span className="input-label">Bio</span>
          <p className="user-info-text">{user.bio}</p>
        </div>
        <div className="p-info__third-row">
          <div className="user-clg-year-wrapper">
            <span className="input-label">College Year</span>
            <p className="user-info-text">{user.collegeYear}</p>
          </div>
          <div className="user-clg-roll-wrapper">
            <span className="input-label">College Roll</span>
            <p className="user-info-text">{user.rollNumber}</p>
          </div>
        </div>
        <div className="p-info__fourth-row">
          <div className="user-fav-sub-wrapper">
            <span className="input-label">Favourite Subject</span>
            <p className="user-info-text">{user.favouriteSubject}</p>
          </div>
          <div className="user-non-fav-sub-wrapper">
            <span className="input-label">Not So Favourite Subject</span>
            <p className="user-info-text">{user.notFavSubject}</p>
          </div>
        </div>
      </div>
      <div className="uploaded-notes-section">
        <div className="toggle-header-uploaded-notes">
          {visiting ? (
            <h2 className="user-notes active-section">
              {user.displayName}'s Notes
            </h2>
          ) : (
            <>
              <h2 className="user-notes active-section">My Notes</h2>
              <h2 className="student-saved-notes">Saved Notes</h2>
            </>
          )}
        </div>
        <div className="notes-container">
          {user.featuredNotesCount === 0 && <p>No Notes to Show</p>}
        </div>
      </div>
    </div>
  );
};

