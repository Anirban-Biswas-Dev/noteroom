import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostsSection from "./PostsSection";
import PersonalInformation from "./PersonalInformation";
import BasicInformation from "./BasicInformation"
import "../../public/css/user-profile.css"
import { useAppData } from "../../context/AppDataContext";

export default function UserProfile() {
	const [user, setUser] = useState<any>({})
	const { userProfile: [profile, , currentUsername] } = useAppData()
	const { username } = useParams()
	const navigate = useNavigate()

	useEffect(() => {
		async function getProfile() {
			if (username === currentUsername) {
				setUser(profile)
			} else {
				const response = await fetch(`http://127.0.0.1:2000/api/users/${username}`)
				if (response.ok) {
					const data = await response.json()
					if (data && data.ok) {
						setUser(data.profile)
					} else {
						setUser({})
					}
				} else {
					setUser({})
				}
			}
		}

		getProfile()
	}, [username, profile])

	return (
		<div className="middle-section">
			<div className="nav-section">
				<svg
					className="nav-back-btn"
					onClick={() => navigate(-1)}
					width="20"
					height="auto"
					viewBox="0 0 68 68"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M16.6029 29.8333H67.332V38.1666H16.6029L39.9362 61.5L33.9987 67.3333L0.665367 34L33.9987 0.666649L39.9362 6.49998L16.6029 29.8333Z"
						fill="#1D1B20"
					/>
				</svg>
			</div>

			<BasicInformation user={user}></BasicInformation>

			<PersonalInformation user={user}></PersonalInformation>

			<PostsSection user={user}></PostsSection>

		</div>
	);
};

