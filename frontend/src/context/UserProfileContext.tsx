import { createContext, ReactNode } from "react";
import useProfile from "../customHooks/useProfile";

export const UserProfileContext = createContext<any>(null)

export function UserProfileProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [profile, setProfile] = useProfile()

    return (
        <UserProfileContext.Provider value={[profile, setProfile]}>
            { children }
        </UserProfileContext.Provider>
    )
} 