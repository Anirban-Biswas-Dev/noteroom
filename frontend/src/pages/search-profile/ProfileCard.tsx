export default function Profile({ user }: { user: any }) {
    return (
        <div className="prfl">
            <img src={"https://avatar.iran.liara.run/public/90"} alt="Profile Pic" className="prfl-pic" />
            <div className="results-prfl-info">
                <span className="prfl-name">{user.displayname}</span>
                <span className="prfl-desc">{user.bio.slice(0, 30)}...</span>
            </div>
        </div>
    )
}
