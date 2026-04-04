import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";

function JoinTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamsRes = await api.get("/teams");
        setTeams(teamsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Find teams where the current user is a member
  const getMyTeams = () => {
    if (!user) return [];
    const uid = user.id || "";
    return teams.filter(t =>
      t.managerId === uid ||
      (t.playerIds && t.playerIds.includes(uid))
    );
  };

  const myTeams = getMyTeams();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return alert("Please select a team");

    // Verify the team belongs to the user
    const isMyTeam = myTeams.some(t => t.id === selectedTeam);
    if (!isMyTeam) return alert("You can only register your own team.");

    try {
      await api.post(`/tournaments/${id}/join`, { teamId: selectedTeam });
      alert("Success! Team has joined the tournament.");
      navigate(`/tournaments/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  if (loading) return <div className="p-5 text-center">Loading Registration Desk...</div>;

  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <div className="card shadow" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 className="text-center">Register for Tournament</h2>
          <p className="text-center text-light">Select your team to enter the arena</p>

          {myTeams.length === 0 ? (
            <div style={{
              padding: "1.5rem",
              textAlign: "center",
              color: "var(--text-light)",
            }}>
              <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>⚠️ You are not part of any team</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
                Join a team first from the Teams page, then come back to register.
              </p>
              <button
                className="btn btn-primary mt-2"
                onClick={() => navigate("/teams")}
              >
                Browse Teams
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="mt-2">
              <div className="form-group">
                <label>Select Your Team</label>
                <select
                  className="form-control"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="">-- Choose Your Team --</option>
                  {myTeams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-block mt-2">
                Confirm Registration
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default JoinTournament;