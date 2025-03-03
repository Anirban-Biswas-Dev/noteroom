import { FeedSection, QuickPost, DashBoard } from "./pages/dashboard/index";
import { LeftPanel, NoteSearchBar, NotificationModal, RightPanel } from "./partials/index";
import { SavedNotesProvider } from "./context/SavedNotesContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import MobileControlPanel from "./partials/MobileControlPanel";
import { ReactNode, useState } from "react";
import PostView from "./pages/post-view/PostView";
import { VoteProvider } from "./context/VoteContext";


function Providers({ children }: { children: ReactNode[] }) {
	return (
		<UserProfileProvider>
			<SavedNotesProvider>
				<VoteProvider>
					{ children }
				</VoteProvider>
			</SavedNotesProvider>
		</UserProfileProvider>
	)
}

function App() {	
	const [showNotiModal, setShowNotiModal] = useState(false)
	const [showRightPanel, setShowRightPanel] = useState(false)

	return (
		<Providers>
			<LeftPanel />

			<NoteSearchBar notiModalState={[showNotiModal, setShowNotiModal]} />
			<NotificationModal notiState={[showNotiModal, setShowNotiModal]} />

			{/* <DashBoard>
				<QuickPost />
				<FeedSection />
			</DashBoard> */}
			<PostView></PostView>

			<RightPanel notiModalState={[showNotiModal, setShowNotiModal]} rightPanelState={showRightPanel}/>
			
			<MobileControlPanel rightPanelState={[showRightPanel, setShowRightPanel]}/>
		</Providers>
	)
}

export default App;
