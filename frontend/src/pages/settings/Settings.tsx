import "../../public/css/settings.css"
import "../../public/css/header-footer.css"

export default function Settings () {
  const handleNavigation = (url: any) => {
    window.location.href = url;
  };

  return (
    <div className="container">
      {/* Account Information Section */}
      <div className="account-info section">
        <div className="section-header">
          <svg
            width="50"
            height="70"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
          >
            <rect width="40" height="40" fill="url(#pattern0_3792_5288)" />
          </svg>
          <p className="section-title">Account Information</p>
        </div>
        <div className="msg-section">
          <span className="section-msg">You can change your password here</span>
          <button className="section-btn" onClick={() => handleNavigation("/auth/password-change")}>➡️</button>
        </div>
      </div>

      {/* Logout Section */}
      <div className="notifications section">
        <div className="section-header">
          <svg width="45" height="45" className="logout-icon" viewBox="0 0 38 38" fill="none">
            <rect width="38" height="38" fill="url(#pattern0_3792_5303)" />
          </svg>
          <p className="section-title">Logout</p>
        </div>
        <div className="msg-section nft-msg">
          <span className="section-msg">Studied enough for now? Log out and come back anytime.</span>
          <button className="logout" onClick={() => handleNavigation("/logout")}>Logout</button>
        </div>
      </div>

      {/* Others Section */}
      <div className="others section">
        <div className="section-header others">
          <svg width="49" height="13" viewBox="0 0 49 13" fill="none">
            <path d="M23.112 1.02699C25.6184 0.666724 27.8997 2.75324 28.2074 5.68736C28.5151 8.62148 26.7328 11.2921 24.2265 11.6524C21.7201 12.0126 19.4388 9.92611 19.1311 6.992C18.8233 4.05788 20.6057 1.38725 23.112 1.02699Z" fill="#07192D" />
          </svg>
          <p className="section-title">Others</p>
        </div>
        <div className="msg-section">
          <span className="section-msg">User guide</span>
          <button className="section-btn" onClick={() => window.open("https://app.hubspot.com/guide-creator/g/YPlbIIXPTt?uuid=f456224c-8bcd-4673-8a7d-573176e779bb", "_blank")}>➡️</button>
        </div>
        <div className="msg-section">
          <span className="section-msg">Help and Support</span>
          <button className="section-btn" onClick={() => handleNavigation("/support")}>➡️</button>
        </div>
        <div className="msg-section">
          <span className="section-msg">Privacy Policy</span>
          <button className="section-btn" onClick={() => handleNavigation("/privacy-policy")}>➡️</button>
        </div>
        <div className="msg-section">
          <span className="section-msg">Help Us Improve NoteRoom</span>
          <button className="section-btn" onClick={() => handleNavigation("/support")}>➡️</button>
        </div>
        <div className="msg-section">
          <span className="section-msg">About the Team</span>
          <button className="section-btn" onClick={() => handleNavigation("/about-us")}>➡️</button>
        </div>
      </div>
    </div>
  );
};

