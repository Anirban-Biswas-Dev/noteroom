import { FeedSection, QuickPost, DashBoard } from "./pages/dashboard/index";
import { LeftPanel, NoteSearchBar, NotificationModal, RightPanel } from "./partials/index";
import { SavedNotesProvider } from "./context/SavedNotesContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import MobileControlPanel from "./partials/MobileControlPanel";
import { useState } from "react";


function App() {	
	const [showNotiModal, setShowNotiModal] = useState(false)
	const [showRightPanel, setShowRightPanel] = useState(false)

	return (
		<UserProfileProvider>

			<SavedNotesProvider>
				<LeftPanel />

				<NoteSearchBar notiModalState={[showNotiModal, setShowNotiModal]}/>
				<NotificationModal notiState={[showNotiModal, setShowNotiModal]}></NotificationModal>

				<DashBoard>
					<QuickPost />
					<FeedSection />
				</DashBoard>

				<RightPanel notiModalState={[showNotiModal, setShowNotiModal]} rightPanelState={showRightPanel}/>
				
				<MobileControlPanel rightPanelState={[showRightPanel, setShowRightPanel]}/>
			</SavedNotesProvider>

		</UserProfileProvider>
	)
}

export default App;
