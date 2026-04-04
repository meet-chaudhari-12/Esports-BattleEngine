import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function CreatePlayer() {
  const [formData, setFormData] = useState({
    name: "",
    inGameName: "",
    role: "",
    country: "",
    age: "",
    teamId: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const playerData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };
      await api.post("/players", playerData);
      navigate("/players");
    } catch (err) {
      setError("Failed to create player. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="card-header">
            <h1 className="card-title">Add Player</h1>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Player Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter player name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">In-Game Name</label>
              <input
                type="text"
                name="inGameName"
                className="form-input"
                placeholder="Enter in-game name"
                value={formData.inGameName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="">Select role</option>
                <option value="Assaulter">Assaulter</option>
                <option value="Support">Support</option>
                <option value="Sniper">Sniper</option>
                <option value="IGL">IGL</option>
                <option value="Fragger">Fragger</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                className="form-input"
                placeholder="Enter country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                name="age"
                className="form-input"
                placeholder="Enter age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Team ID (Optional)</label>
              <input
                type="text"
                name="teamId"
                className="form-input"
                placeholder="Enter team ID if player is on a team"
                value={formData.teamId}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Add Player"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate("/players")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePlayer;
