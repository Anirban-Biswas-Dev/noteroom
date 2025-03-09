import "../../public/css/dashboard.css";
import '../../public/css/quick-post.css';
import "../../public/css/main-pages.css";
import "../../public/css/share-note.css";
import QuickPost from "./QuickPost";
import FeedSection from "./FeedSection";

export default function DashBoard() {
    return (
        <div className="middle-section">
            <QuickPost></QuickPost>
            <FeedSection></FeedSection>
        </div>
    )
}
