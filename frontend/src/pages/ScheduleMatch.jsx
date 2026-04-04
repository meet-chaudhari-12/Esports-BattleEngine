import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";

function ScheduleMatch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isOrganizer } = useAuth();

  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    tournamentId: searchParams.get("t") || "",
    teamIds: [],
    scheduledAt: "",
    round: "1",
  });
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Selected tournament details (for auto-populating teams list)
  const [selectedTournament, setSelectedTournament] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/tournaments").catch(() => ({ data: [] })),
      api.get("/teams").catch(() => ({ data: [] })),
    ]).then(([tRes, teamRes]) => {
      setTournaments(tRes.data || []);
      setTeams(teamRes.data || []);

      // If tournament pre-selected from URL, load its data
      const preselected = searchParams.get("t");
      if (preselected && tRes.data) {
        const t = tRes.data.find(t => t.id === preselected);
        if (t) setSelectedTournament(t);
      }
    }).finally(() => setPageLoading(false));
  }, []);

  // When tournament changes, update selectedTournament for context
  const handleTournamentChange = (e) => {
    const tid = e.target.value;
    setFormData(prev => ({ ...prev, tournamentId: tid, teamIds: [] }));
    const t = tournaments.find(t => t.id === tid);
    setSelectedTournament(t || null);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTeam = () => {
    if (selectedTeam && !formData.teamIds.includes(selectedTeam)) {
      setFormData(prev => ({ ...prev, teamIds: [...prev.teamIds, selectedTeam] }));
      setSelectedTeam("");
    }
  };

  const removeTeam = (tid) => {
    setFormData(prev => ({ ...prev, teamIds: prev.teamIds.filter(id => id !== tid) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.teamIds.length < 2) {
      setError("Please select at least 2 teams.");
      return;
    }

    if (!formData.tournamentId) {
      setError("Please select a tournament.");
      return;
    }

    setLoading(true);
    try {
      const matchData = {
        tournamentId: formData.tournamentId,
        teamIds: formData.teamIds,
        scheduledAt: formData.scheduledAt || null,
        round: formData.round ? parseInt(formData.round) : 1,
        // game is auto-inherited from tournament on the backend
      };

      const res = await api.post("/matches/schedule", matchData);
      setSuccess("✅ Match scheduled successfully!");
      setTimeout(() => {
        navigate(`/tournaments/${formData.tournamentId}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule match. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Available teams: if tournament has registered teams, only show those; otherwise show all
  const availableTeams = selectedTournament?.teamIds?.length > 0
    ? teams.filter(t => selectedTournament.teamIds.includes(t.id))
    : teams;

  if (pageLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Navbar />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: 48, height: 48, border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "100px 24px 60px" }}>

        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "2.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "2rem" }}>⚔️</span>
              <h1 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "1.8rem", fontWeight: 900, margin: 0 }}>
                Schedule Match
              </h1>
            </div>
            {selectedTournament && (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                Tournament: <strong style={{ color: "#f97316" }}>{selectedTournament.name}</strong>
                {selectedTournament.game && <span style={{ marginLeft: "0.5rem", color: "rgba(255,255,255,0.3)" }}>• {selectedTournament.game}</span>}
              </p>
            )}
          </div>

          {error && (
            <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#f87171", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: "12px 16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, color: "#4ade80", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Tournament */}
            <div>
              <label style={labelStyle}>Tournament *</label>
              <select
                value={formData.tournamentId}
                onChange={handleTournamentChange}
                required
                style={selectStyle}
              >
                <option value="">— Select tournament —</option>
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.gameIcon || "🎮"} {t.name} ({t.game || "Unknown"}) — {t.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Teams */}
            <div>
              <label style={labelStyle}>Add Teams * (min 2)</label>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <select
                  value={selectedTeam}
                  onChange={e => setSelectedTeam(e.target.value)}
                  style={{ ...selectStyle, flex: 1 }}
                >
                  <option value="">— Select team —</option>
                  {availableTeams
                    .filter(t => !formData.teamIds.includes(t.id))
                    .map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={addTeam}
                  style={{ padding: "0 20px", background: "rgba(249,115,22,0.15)", color: "#f97316", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  + Add
                </button>
              </div>

              {formData.teamIds.length > 0 && (
                <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {formData.teamIds.map(tid => {
                    const t = teams.find(t => t.id === tid);
                    return (
                      <span
                        key={tid}
                        onClick={() => removeTeam(tid)}
                        style={{ padding: "5px 12px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa", borderRadius: 8, fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                      >
                        {t?.name || tid.slice(-6).toUpperCase()} <span style={{ opacity: 0.6 }}>×</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Round and Date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Round</label>
                <input
                  type="number"
                  name="round"
                  min="1"
                  value={formData.round}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="e.g. 1"
                />
              </div>
              <div>
                <label style={labelStyle}>Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
              <button
                type="submit"
                disabled={loading}
                style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "white", border: "none", borderRadius: 12, fontWeight: 800, cursor: "pointer", fontSize: "1rem", opacity: loading ? 0.7 : 1, boxShadow: "0 4px 15px rgba(249,115,22,0.3)" }}
              >
                {loading ? "Scheduling…" : "Schedule Match ⚔️"}
              </button>
              <button
                type="button"
                onClick={() => navigate(formData.tournamentId ? `/tournaments/${formData.tournamentId}` : "/tournaments")}
                style={{ padding: "14px 20px", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
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

const labelStyle = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
  marginBottom: "8px",
};

const selectStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};

export default ScheduleMatch;
