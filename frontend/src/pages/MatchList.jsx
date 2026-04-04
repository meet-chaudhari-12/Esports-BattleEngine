import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function MatchList() {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchMatches();
    } else {
      setMatches([]);
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const response = await api.get("/tournaments");
      setTournaments(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.normalizedMessage ||
          "Failed to load tournaments. You may not have permission or the server may be down."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await api.get(`/matches/tournament/${selectedTournament}`);
      setMatches(response.data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 400) {
        setError(
          err.normalizedMessage ||
            "Failed to load matches due to a bad request."
        );
      } else if (err.response?.status === 403) {
        setError(
          err.normalizedMessage ||
            "You do not have permission to view matches for this tournament."
        );
      } else {
        setError(
          err.normalizedMessage ||
            "Failed to load matches. Please try again."
        );
      }
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
            <h1 className="card-title">Matches</h1>
            <Link to="/schedule-match" className="btn btn-primary">
              + Schedule Match
            </Link>
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
              <h3>Select a tournament to view matches</h3>
            </div>
          ) : matches.length === 0 ? (
            <div className="empty-state">
              <h3>No matches found for this tournament</h3>
              <Link to="/schedule-match" className="btn btn-primary mt-2">
                Schedule Match
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Match ID</th>
                    <th>Game</th>
                    <th>Teams</th>
                    <th>Status</th>
                    <th>Scheduled At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id}>
                      <td>{match.id?.substring(0, 8)}...</td>
                      <td>{match.game || "N/A"}</td>
                      <td>{match.teamIds?.length || 0} teams</td>
                      <td>
                        <span className={`badge ${
                          match.status === "COMPLETED" ? "badge-success" :
                          match.status === "SCHEDULED" ? "badge-info" :
                          "badge-warning"
                        }`}>
                          {match.status || "PENDING"}
                        </span>
                      </td>
                      <td>
                        {match.scheduledAt 
                          ? new Date(match.scheduledAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>
                        <Link
                          to={`/matches/${match.id}`}
                          className="btn btn-outline btn-sm"
                        >
                          View
                        </Link>
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

export default MatchList;
