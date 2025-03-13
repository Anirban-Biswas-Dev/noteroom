import { districtCollegeData } from "../../utils/onboarding-data" 

export default function PersonalInformation({ user }: { user: any }) {
    const collegeID = user.collegeID
    let collegeData: any = { name: collegeID, logo: "placeholder.png" }

    if (!isNaN(collegeID)) {
        let data = Object.values(districtCollegeData).flat().find(data => data.id === collegeID)
        collegeData = { name: data?.name, logo: data?.logo }
    }

	return (
		<div className="ms-personal-info-container">
			<div className="p-info__first-row">
				<div className="user-clg-wrapper">
					<span className="input-label">College</span>
					<p className="user-info-text" id="college-name">{collegeData.name || <i>Not Given</i>}</p>
				</div>
			</div>
			<div className="p-info__second-row">
				<div className="user-bio-wrapper">
					<span className="input-label">Bio</span>
					<p className="user-info-text">{user.bio}</p>
				</div>
			</div>
			<div className="p-info__third-row">
				<div className="user-clg-year-wrapper">
					<span className="input-label">College Year</span>
					<p className="user-info-text">{user.collegeyear}</p>
				</div>
				<div className="user-clg-roll-wrapper">
					<span className="input-label">College Roll</span>
					<p className="user-info-text">{user.rollnumber}</p>
				</div>
			</div>
			<div className="p-info__fourth-row">
				<div className="user-fav-sub-wrapper">
					<span className="input-label">Favourite Subject</span>
					<p className="user-info-text">{user.favouritesubject}</p>
				</div>
				<div className="user-non-fav-sub-wrapper">
					<span className="input-label">Not So Favourite Subject</span>
					<p className="user-info-text">{user.notfavsubject}</p>
				</div>
			</div>
		</div>

	)
}