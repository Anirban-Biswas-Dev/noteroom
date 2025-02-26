import { ReactNode } from "react";

export default function DashBoard({ children }: { children: ReactNode[] }) {
    return (
        <div className="middle-section">
            { children }
        </div>
    )
}
