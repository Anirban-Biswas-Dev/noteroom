import { createContext, ReactNode, useState } from "react";

export const ScrollPositionContext = createContext<any>(null)

export default function ScrollPositionProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [feedScrollPosition, setFeedScrollPosition] = useState<number>(0)

    return (
        <ScrollPositionContext.Provider value={[feedScrollPosition, setFeedScrollPosition]}>
            { children }
        </ScrollPositionContext.Provider>
    ) 
}
