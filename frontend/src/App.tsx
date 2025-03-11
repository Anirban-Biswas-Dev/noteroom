import { DashBoard } from "./pages/dashboard/index";
import { LeftPanel, NoteSearchBar, NotificationModal, RightPanel } from "./partials/index";
import { SavedNotesProvider } from "./context/SavedNotesContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import MobileControlPanel from "./partials/MobileControlPanel";
import { ReactNode, useState } from "react";
import PostView from "./pages/post-view/PostView";
import { Route, Routes } from "react-router-dom";
import SearchProfile from "./pages/search-profile/SearchProfile";
import FeedNotesProvider from "./context/FeedNoteContext";
import ScrollPositionProvider from "./context/ScrollPosition";
// import Settings from "./pages/Settings/Settings";	


function Providers({ children }: { children: ReactNode | ReactNode[] }) {
	// FIXME: Combine the saved notes and user profile in one context. cause they are under user profile maybe.
	return (
		<ScrollPositionProvider>
			<SavedNotesProvider>
				<FeedNotesProvider>
					<UserProfileProvider>
						{ children }
					</UserProfileProvider>
				</FeedNotesProvider>
			</SavedNotesProvider>
		</ScrollPositionProvider>
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
				<Route path="/feed" element={<DashBoard />} />
				<Route path="/post/:postID" element={<PostView />} />
				<Route path="/search-profile" element={<SearchProfile />} />
			</Routes>
			{/* <Routes>
				<Route path="/settings" element={<Settings />} />
			</Routes> */}

			<RightPanel notiModalState={[showNotiModal, setShowNotiModal]} rightPanelState={showRightPanel}/>		
			<MobileControlPanel rightPanelState={[showRightPanel, setShowRightPanel]}/>
		</Providers>
	)
}

export default App;
