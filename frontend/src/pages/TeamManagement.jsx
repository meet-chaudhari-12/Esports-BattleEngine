import { useState, useEffect } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    org: "",
    region: "",
    coach: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      // Sends the full object matching your Team.java fields
      await api.post("/teams", formData);
      setFormData({ name: "", org: "", region: "", coach: "" });
      fetchTeams();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Check backend validation"));
    }
  };

  if (loading) return <div className="p-5 text-center">Loading Team Registry...</div>;

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="card mb-4 shadow-sm">
          <h2 className="card-title">Register Team Details</h2>
          <form onSubmit={handleCreateTeam} className="mt-2">
            <div className="grid grid-2 gap-1">
              <input 
                name="name"
                type="text" 
                className="form-control"
                placeholder="Team Name (Required)" 
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input 
                name="org"
                type="text" 
                className="form-control"
                placeholder="Organization (e.g. NAVI)" 
                value={formData.org}
                onChange={handleInputChange}
              />
              <input 
                name="region"
                type="text" 
                className="form-control"
                placeholder="Region (e.g. India, EU)" 
                value={formData.region}
                onChange={handleInputChange}
              />
              <input 
                name="coach"
                type="text" 
                className="form-control"
                placeholder="Coach Name" 
                value={formData.coach}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-1 w-100">Create Team Profile</button>
          </form>
        </div>

        <div className="grid grid-3 gap-2">
          {teams.map(team => (
            <div key={team.id} className="card p-2 border">
              <h4 className="m-0 text-primary">{team.name}</h4>
              <p className="m-0"><strong>Org:</strong> {team.org || 'N/A'}</p>
              <p className="m-0"><strong>Region:</strong> {team.region || 'Unknown'}</p>
              <p className="m-0"><strong>Coach:</strong> {team.coach || 'None'}</p>
              <hr />
              <small className="text-light">Players: {team.playerIds?.length || 0}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamManagement;