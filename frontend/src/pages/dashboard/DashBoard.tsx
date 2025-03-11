import QuickPost from "./QuickPost";
import FeedSection from "./FeedSection";
import { useContext, useEffect, useRef } from "react";
import { ScrollPositionContext } from "../../context/ScrollPosition";
import "../../public/css/dashboard.css";
import '../../public/css/quick-post.css';
import "../../public/css/main-pages.css";
import "../../public/css/share-note.css";

export default function DashBoard() {
    const middleSection = useRef<HTMLDivElement | null>(null)
    const [position, setPosition] = useContext(ScrollPositionContext)

    useEffect(() => {
        if (window.history.scrollRestoration) {
            window.history.scrollRestoration = "manual";
        }

        middleSection.current?.scrollTo({
            top: position,
            left: 0,
            behavior: 'instant'
        });

        const handleScroll = () => {
            setPosition(middleSection.current?.scrollTop)
        };

        let rafId: number;
        const throttledHandleScroll = () => {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(handleScroll);
        };

        middleSection.current?.addEventListener("scroll", throttledHandleScroll, { passive: true });

        return () => {
            middleSection.current?.removeEventListener("scroll", throttledHandleScroll);
            cancelAnimationFrame(rafId);
        };
    }, [])

    return (
        <div className="middle-section" ref={middleSection}>
            <QuickPost></QuickPost>
            <FeedSection></FeedSection>
        </div>
    )
}
