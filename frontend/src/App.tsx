import { createContext } from "react";
import { FeedSection, QuickPost, DashBoard } from "./pages/dashboard/index";
import { LeftPanel, NoteSearchBar, RightPanel } from "./partials/index";
import useProfile from "./customHooks/useProfile";

export const ProfileContext = createContext<any>({})

function App() {
  const profile = useProfile()
	
  return (
    <ProfileContext.Provider value={profile}>
		<LeftPanel />
			<NoteSearchBar />

			<DashBoard>
				<QuickPost />
				<FeedSection />
			</DashBoard>

		<RightPanel />

    </ProfileContext.Provider>
  )
}

export default App;
