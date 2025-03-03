import { FeedSection, QuickPost, DashBoard } from "./pages/dashboard/index";
import { LeftPanel, NoteSearchBar, NotificationModal, RightPanel } from "./partials/index";
import { SavedNotesProvider } from "./context/SavedNotesContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import MobileControlPanel from "./partials/MobileControlPanel";
import { ReactNode, useState } from "react";
import PostView from "./pages/post-view/PostView";
import { VoteProvider } from "./context/VoteContext";
import { Route, Routes } from "react-router-dom";


function Providers({ children }: { children: ReactNode | ReactNode[] }) {
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

			<Routes>
				<Route path="/feed" element={
					<DashBoard>
						<QuickPost />
						<FeedSection />
					</DashBoard>
				} />
				<Route path="/post/:postID" element={<PostView></PostView>} />
			</Routes>

			<RightPanel notiModalState={[showNotiModal, setShowNotiModal]} rightPanelState={showRightPanel}/>		
			<MobileControlPanel rightPanelState={[showRightPanel, setShowRightPanel]}/>
		</Providers>
	)
}

export default App;
