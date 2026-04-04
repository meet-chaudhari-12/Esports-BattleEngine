import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function PlayerList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await api.get("/players");
      setPlayers(response.data);
    } catch (err) {
      setError("Failed to load players");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this player?")) {
      return;
    }

    try {
      await api.delete(`/players/${id}`);
      fetchPlayers();
    } catch (err) {
      alert("Failed to delete player");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading players...</div>
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
            <h1 className="card-title">Players</h1>
            <Link to="/create-player" className="btn btn-primary">
              + Add Player
            </Link>
          </div>

          {error && <div className="error">{error}</div>}

          {players.length === 0 ? (
            <div className="empty-state">
              <h3>No players found</h3>
              <p>Add your first player to get started</p>
              <Link to="/create-player" className="btn btn-primary mt-2">
                Add Player
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>In-Game Name</th>
                    <th>Role</th>
                    <th>Country</th>
                    <th>Age</th>
                    <th>Team</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td style={{ fontWeight: "500" }}>{player.name}</td>
                      <td>{player.inGameName || "N/A"}</td>
                      <td>{player.role || "N/A"}</td>
                      <td>{player.country || "N/A"}</td>
                      <td>{player.age || "N/A"}</td>
                      <td>{player.teamId || "Free Agent"}</td>
                      <td>
                        <div className="flex gap-1">
                          <Link
                            to={`/players/${player.id}`}
                            className="btn btn-outline btn-sm"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(player.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
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

export default PlayerList;
