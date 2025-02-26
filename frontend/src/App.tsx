import { FeedSection, QuickPost, DashBoard } from "./pages/dashboard/index";
import { LeftPanel, NoteSearchBar, RightPanel } from "./partials/index";
import { SavedNotesProvider } from "./context/SavedNotesContext";
import { UserProfileProvider } from "./context/UserProfileContext";


function App() {	
  return (
    <UserProfileProvider>

		<SavedNotesProvider>
			<LeftPanel />

			<NoteSearchBar />

			<DashBoard>
				<QuickPost />
				<FeedSection />
			</DashBoard>

			<RightPanel />
		</SavedNotesProvider>

    </UserProfileProvider>
  )
}

export default App;
