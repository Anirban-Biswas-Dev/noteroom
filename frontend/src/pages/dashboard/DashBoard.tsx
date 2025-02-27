import { ReactNode } from "react";
import "../../public/css/dashboard.css";
import '../../public/css/quick-post.css';
import "../../public/css/main-pages.css";
import "../../public/css/share-note.css";

export default function DashBoard({ children }: { children: ReactNode[] }) {
    return (
        <div className="middle-section">
            { children }
        </div>
    )
}
