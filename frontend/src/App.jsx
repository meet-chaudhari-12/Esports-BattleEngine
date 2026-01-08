import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TournamentList from "./pages/TournamentList";
import CreateTournament from "./pages/CreateTournament";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tournaments" element={<TournamentList />} />
        <Route path="/create-tournament" element={<CreateTournament />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
