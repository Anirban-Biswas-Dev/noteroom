import { createContext, ReactNode } from "react";
import { voteNoteApi } from "../utils/noteActionsApi";

export const VoteContext = createContext<any>(null)

export function VoteProvider({ children }: { children: ReactNode | ReactNode[] }) {
    async function upvoteFunction(data: any, [isUpvoted, setIsUpvoted]: [boolean, any], [upvoteCount, setupvoteCount]: [number, any]) {
        setIsUpvoted((prev: boolean) => !prev)
        setupvoteCount(upvoteCount + (!isUpvoted ? +1 : -1));
        await voteNoteApi(data, isUpvoted)
    }

    return (
        <VoteContext.Provider value={[upvoteFunction]}>
            {children}
        </VoteContext.Provider>
    )
} 
