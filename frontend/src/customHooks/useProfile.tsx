import { useEffect, useState } from "react";

export default function useProfile() {
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

    return { profile }
}
