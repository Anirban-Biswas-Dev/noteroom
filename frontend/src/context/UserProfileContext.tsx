import { createContext, ReactNode, useEffect, useState } from "react";

export const UserProfileContext = createContext<any>(null)

export function UserProfileProvider({ children }: { children: ReactNode | ReactNode[] }) {
    const [profile, setProfile] = useState<any>({})
    
    useEffect(() => {
        async function getProfile() {
            try {
                let response = await fetch('http://127.0.0.1:2000/api/user/profile')
                let profile = await response.json()
                if (profile.profile) {
                    setProfile(profile.profile)
                } else {
                    setProfile({ })
                }
            } catch (error) {
                console.log(error)
            }
        }

        getProfile()
    }, [])
    
    return (
        <UserProfileContext.Provider value={[profile, setProfile]}>
            { children }
        </UserProfileContext.Provider>
    )
} 
