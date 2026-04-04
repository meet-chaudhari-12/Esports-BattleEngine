import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function TeamList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await api.get("/teams");
      setTeams(response.data);
    } catch (err) {
      setError("Failed to load teams");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team?")) {
      return;
    }

    try {
      await api.delete(`/teams/${id}`);
      fetchTeams();
    } catch (err) {
      alert("Failed to delete team");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">Loading teams...</div>
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
            <h1 className="card-title">Teams</h1>
            <Link to="/create-team" className="btn btn-primary">
              + Create Team
            </Link>
          </div>

          {error && <div className="error">{error}</div>}

          {teams.length === 0 ? (
            <div className="empty-state">
              <h3>No teams found</h3>
              <p>Create your first team to get started</p>
              <Link to="/create-team" className="btn btn-primary mt-2">
                Create Team
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Organization</th>
                    <th>Region</th>
                    <th>Players</th>
                    <th>Rank</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td style={{ fontWeight: "500" }}>{team.name}</td>
                      <td>{team.org || "N/A"}</td>
                      <td>{team.region || "N/A"}</td>
                      <td>{team.playerIds?.length || 0}</td>
                      <td>{team.rank || "N/A"}</td>
                      <td>
                        <div className="flex gap-1">
                          <Link
                            to={`/teams/${team.id}`}
                            className="btn btn-outline btn-sm"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(team.id)}
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

export default TeamList;
