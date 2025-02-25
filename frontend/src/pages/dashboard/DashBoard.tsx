import { ReactNode } from "react";

export default function DashBoard({ children }: { children: ReactNode[] }) {
    return (
        <div className="middle-section">
            {children[0]} {/* Quick Post */}
            {children[1]} {/* Feed Section */}
        </div>
    )
}
