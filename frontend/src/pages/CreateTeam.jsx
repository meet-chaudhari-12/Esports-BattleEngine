import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function CreateTeam() {
  const [formData, setFormData] = useState({
    name: "",
    org: "",
    region: "",
    coach: ""
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
      await api.post("/teams", formData);
      navigate("/teams");
    } catch (err) {
      setError("Failed to create team. Please try again.");
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
            <h1 className="card-title">Create Team</h1>
          </div>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Team Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Enter team name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Organization</label>
              <input
                type="text"
                name="org"
                className="form-input"
                placeholder="Enter organization name"
                value={formData.org}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Region</label>
              <input
                type="text"
                name="region"
                className="form-input"
                placeholder="Enter region"
                value={formData.region}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Coach</label>
              <input
                type="text"
                name="coach"
                className="form-input"
                placeholder="Enter coach name"
                value={formData.coach}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Team"}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate("/teams")}
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

export default CreateTeam;
