import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function Leaderboard() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchLeaderboard();
    } else {
      setLeaderboard([]);
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const response = await api.get("/tournaments");
      setTournaments(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/leaderboard/${selectedTournament}`);
      setLeaderboard(response.data);
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Leaderboard</h1>
          </div>

          <div className="form-group" style={{ maxWidth: "400px" }}>
            <label className="form-label">Select Tournament</label>
            <select
              className="form-select"
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
            >
              <option value="">Select a tournament</option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error">{error}</div>}

          {!selectedTournament ? (
            <div className="empty-state">
              <h3>Select a tournament to view leaderboard</h3>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="empty-state">
              <h3>No leaderboard data available</h3>
              <p>Matches need to be completed to generate leaderboard</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team</th>
                    <th>Score</th>
                    <th>Kills</th>
                    <th>Placement</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.teamId || index}>
                      <td>
                        <strong style={{ fontSize: "1.2rem" }}>
                          #{index + 1}
                        </strong>
                      </td>
                      <td style={{ fontWeight: "500" }}>
                        {entry.teamName || entry.teamId || "Unknown Team"}
                      </td>
                      <td>
                        <strong style={{ color: "var(--primary)" }}>
                          {entry.totalScore || 0}
                        </strong>
                      </td>
                      <td>{entry.metadata?.kills || 0}</td>
                      <td>
                        <span className="badge badge-info">
                          {entry.averagePlacement 
                            ? entry.averagePlacement.toFixed(1)
                            : "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
