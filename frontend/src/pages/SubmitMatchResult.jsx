import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function SubmitMatchResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [rule, setRule] = useState(null);
  const [teams, setTeams] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, teamsRes] = await Promise.all([
          api.get(`/matches/${id}`),
          api.get(`/teams`).catch(() => ({ data: [] })),
        ]);
        const m = matchRes.data;
        setMatch(m);
        setTeams(teamsRes.data || []);

        if (m.gameName) {
          const ruleRes = await api.get(`/rules/${m.gameName}`).catch(() => ({ data: null }));
          setRule(ruleRes.data);
        }

        // Initialize results for each team
        const init = {};
        m.teamIds?.forEach(tid => { init[tid] = {}; });
        setResults(init);
      } catch (err) {
        setError("Failed to load match data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const teamName = (teamId) => {
    const t = teams.find(t => t.id === teamId);
    return t ? t.name : teamId?.slice(-6)?.toUpperCase() || "Team";
  };

  const handleInput = (teamId, field, value) => {
    setResults(prev => ({
      ...prev,
      [teamId]: { ...prev[teamId], [field]: parseInt(value) || 0 }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post(`/matches/${id}/result`, results);
      // Redirect to the dedicated Match Result page (leaderboard + standings)
      navigate(`/matches/${id}/result-page`);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to submit result.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Navbar />
      <div style={{ textAlign: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 48, height: 48, border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading match engine…</p>
      </div>
    </div>
  );

  if (!match) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      <Navbar />
      <h2>Match not found</h2>
    </div>
  );

  const accentColor = rule?.color || "#f97316";
  const scoringType = rule?.scoringType || "POINTS";

  const getScoringFields = () => {
    if (match.gameName === "BGMI" || scoringType === "PLACEMENT") {
      return [
        { key: "placement", label: "Placement", placeholder: "e.g. 1", required: true },
        { key: "kills", label: "Kills", placeholder: "0", required: false },
      ];
    }
    if (match.gameName === "VALORANT" || scoringType === "ROUND") {
      return [
        { key: "roundsWon", label: "Rounds Won", placeholder: "e.g. 13", required: true },
      ];
    }
    if (match.gameName === "F1_23" || scoringType === "TIME") {
      return [
        { key: "position", label: "Final Position", placeholder: "e.g. 1", required: true },
        { key: "fastestLap", label: "Fastest Lap Points", placeholder: "0 or 1", required: false },
      ];
    }
    // Default / CS:GO / others
    return [
      { key: "score", label: "Final Score / Points", placeholder: "0", required: true },
    ];
  };

  const fields = getScoringFields();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "100px 24px 60px" }}>

        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "2.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "0.75rem" }}>
              {rule?.icon || "⚔️"}
            </span>
            <h1 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "2rem", fontWeight: 900 }}>
              Submit Match Results
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>
              {rule?.fullName || match.game} &bull; Round {match.round || 1}
            </p>
            {/* VS display */}
            {match.teamIds?.length >= 2 && (
              <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", fontFamily: "'Exo 2', sans-serif", fontWeight: 900, fontSize: "1.4rem" }}>
                <span style={{ color: accentColor }}>{teamName(match.teamIds[0])}</span>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.9rem" }}>VS</span>
                <span style={{ color: accentColor }}>{teamName(match.teamIds[1])}</span>
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, color: "#f87171", marginBottom: "1.5rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {match.teamIds?.map(teamId => (
                <div key={teamId} style={{
                  padding: "1.5rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 16,
                  border: `1px solid ${accentColor}20`,
                  borderLeft: `3px solid ${accentColor}`
                }}>
                  <h3 style={{ margin: "0 0 1rem", color: accentColor, fontWeight: 800, fontSize: "1rem", fontFamily: "'Exo 2', sans-serif" }}>
                    🎮 {teamName(teamId)}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: fields.length === 1 ? "1fr" : "1fr 1fr", gap: "1rem" }}>
                    {fields.map(field => (
                      <div key={field.key}>
                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", marginBottom: "6px" }}>
                          {field.label}{field.required ? " *" : ""}
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder={field.placeholder}
                          required={field.required}
                          onChange={e => handleInput(teamId, field.key, e.target.value)}
                          style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ flex: 1, padding: "16px", background: `linear-gradient(135deg, ${accentColor}, #ea580c)`, color: "white", border: "none", borderRadius: 14, fontWeight: 800, cursor: "pointer", fontSize: "1rem", opacity: submitting ? 0.7 : 1, boxShadow: `0 6px 20px ${accentColor}40` }}
              >
                {submitting ? "Submitting…" : "✅ Verify & Complete Match"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/tournaments/${match.tournamentId}`)}
                style={{ padding: "16px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600, cursor: "pointer" }}
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

export default SubmitMatchResult;