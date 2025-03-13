import { useState } from "react"
import { RequestModal } from "../../partials"

export default function BasicInformation({ user }: { user: any }) {
	const [reqModalShow, setReqModalShow] = useState<boolean>(false)
	let badge = user?.badges ? user.badges[0] : { badgeID: 0, badgeLogo: 'no_badge.png', badgeText: 'No Badge' }

	return (
		<div className="ms-first-row">
			<div className="user-prfl-pic-wrapper">
				<img
					className="user-prfl-pic"
					src={user.profile_pic}
					alt="Profile Picture"
				/>
			</div>
			<div className="info-items">
				<span className="display-name">{user.displayname}</span>
				<div className="user-group">{user.group}</div>
				<div className="user-gains">
					<div className="badge">
						<img
							className="badge-logo"
							src={`https://avatar.iran.liara.run/public/8`}
							alt="Badge"
						/>
						<div className="top-voice-badge">{badge.badgeText}</div>
					</div>
					{user.featuredNoteCount > 0 ? (
						<div className="featured-note">
							Featured Notes
						</div>
					) : (
						<div className="no-featured-note">No Featured Notes</div>
					)}
				</div>
			</div>
			<div className="user-profile-interaction-container">
				{!user.owner && (
					<>
						<button className="user-profile-request-btn" onClick={() => setReqModalShow(prev => !prev)}>Request</button>
		  				<RequestModal modalShow={[reqModalShow, setReqModalShow]} recipientData={{ profile_pic: user.profile_pic, displayname: user.displayname }}></RequestModal>
					</>
				)}
				<svg className="share-user-profile" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                    <rect width="27.9032" height="27.9032" fill="url(#pattern0_4312_5925)"/>
                    <defs>
                        <pattern id="pattern0_4312_5925" patternContentUnits="objectBoundingBox" width="1" height="1">
                            <use xlinkHref="#image0_4312_5925" transform="scale(0.01)"/>
                        </pattern>
                        <image id="image0_4312_5925" width="100" height="100" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAABgpJREFUeAHtnE1s3EQUx5143LSXHvkqBS58HOBShIQ48XECDggJkAAhAQc4gsrHBYqKBFIpTYET4gQSICTuRSAOORcQR2jmeRtBwgGhFDXJzpukqgbGu+64Wds7a6+9q80/krUTz4zfe//fPM/Ya28Q4A8KQAEoAAWgABSAAlAACkABKAAFoAAUgAJQAApAgXYUIHVjJPXLUaxfCpbVoXaMwkquAiFtPyaoe1EQm97WvWj35TbGzmYVCKV+VJDSDkYKRe2EsXq8Wes4+lUKFMMAlKuEauOf4TAApQ0OiQ1/GIDSOJTRYQBKY1CqwwCUsUOpDwNQxgZlfDAApTaU8cMAlMpQ7IWdILUzeNGXisomkvxNUX1ZXa8PLh694fhlhl4MfudbioD0694vqgcUTxw+mSGk/jA53BAgto1tCyie4u9utq+zfZeQiksFTGHYzh5AvKBIxfvi7Tt3+7Pn/xex+sQbxghAvKDE6uM9D2C3AJHkLwqBZDMj7eiZIWnzstNXGHc/T9vhs69ASOqpXCB5MGyfEYHYLkVQQlJPAESOAoL0aSHV5R4YtSMkH8tp1ttVAYjtKIjfEaQuJTYSW3qx0AYqgiCI1WER84PBytZ1pXpUBJIc87fu9YmNWB0utYHKERSoA2QEM2jqqwCA+CrVUjsA8RR61RwIO/qRSOpXRKw/CCV/lt1ErE8K4vs9j1bcrGEgIuYHrK9Z323ZxmRjszEGK2Z/sYMTrlno6Nsi4q8Fqa3c5euVR3X6NwhjfquWyw0CEZLf9oqB1FZE/OVCR99aK5axdl4yojfqy+/ODgaoLg1dSZU52hSQc90briyLdw+iwv9t7PpEYExY5nLzdWQOCur+MCi2u01eWmeXt1X/GgIiOvxQqc+FUNgIyd8HZA5WDaleP2NCQfxddefVZXvNUdmJhoAEHb7JXZx6DqwsJMlnJpIpQvJ7lWEkAehTlWHYjk0BSa7m9WK92PjdWrGN3Pk835z/GKcbUZHkP4XkMxHpb7ObvZE3lntHDQKxeoSknrS+Zn23ZRuTIF4tBSYV20wbWdeqHZLlXzZNM+VI8h9hrB+uemzvfg0DKfXDmDn7zWYy6DKxZyGFMX9aeoyxVfbmjn+yxjPltdZeCZgkkFTMZXVIEP+Vib//FH4ywf/dylwiYnVfrgPEZiynojTYYZ/TAKR3asv/2oDYRKTuHRZG7fqQ+LlcIFJfCJaMqG3A9wBTAiT4xURCqn/zNAmJn/UNp3I7IdWbBcbPVj5olY7TAiTJEj6bp4mQ6o0qoY3URxAfLzC+NNKB6jaeIiBCqqVcTYiP1w1zaH8AGZQIQKwmyJDeyECGIEMGFUCGOE2QIU6LtIQ5BBmSjoXkuSYse50cSQkZggxxQwJziNMiLSFDkCHpWMAc4pRwJWQIMiQzGnBz0YnRLyFDkCFuUGCV5bRIS8gQZEg6FrDKckq4EjIEGZIZDVhlOTH6JWSIFSJ5etI9KZn9TtvWDajW4A4AseKumgO5v/wglWr7RRoA6Y92QfpUNjOScqxPNpgMuYcGkFQWY+ZFrF6bJ/2r3QSpo4Ex82l1W58A0pbSnnYAxFOotpoBSFtKe9oBEE+h2moGIG0p7WlnskBi9frAUtO+GyL5J0//Z65ZSPxzniZ2Bdh4sKHkZ3KNk9oIyCw07sC0GSCzIEht5mkSSvV04+5Gne49ecbtvkjy8407MGUGIuIXC/WIu3c37669GCt6r454feGcvr15J6bDwr7l7TsE8XoBkLXAmLlWPBWkPypwwr70uP7/m7gvzPTpi8xCkhlSXyjWoc1fqju/dW3RedM5qDaTyS7u/ihmaOtN4PlzRib2jSDevKaV7EiN2BWEcyD/NvherY9IvZrq1N6nMXO9n2MCjOzAs7/20NrcMUB7xewHFDcgI+Kv2v4uZoCJHQ32tvfwOcU5nh1Rs1FWG5M5TQ3icHuSiV6fFsRrsyGy1wBaE6QXW5/AneoepWRu6R7pXdHbzNEnZmtTR21sEXWPTG6u8OCAJlAACkABKAAFoAAUgAJQAApAASgABaAAFIACUKBhBf4Daf1d76XuAvkAAAAASUVORK5CYII="/>
                    </defs>
                </svg> 
			</div>
		</div>

	)
}