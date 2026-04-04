import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";

/* ─── helpers ──────────────────────────────────────────────────── */
const statusColor = (s) => ({
  LIVE: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", border: "#22c55e40" },
  UPCOMING: { bg: "rgba(249,115,22,0.12)", color: "#f97316", border: "#f9731640" },
  COMPLETED: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6", border: "#8b5cf640" },
}[s] || { bg: "rgba(255,255,255,0.06)", color: "#aaa", border: "#ffffff20" });

const matchStatusStyle = (s) => ({
  COMPLETED: { bg: "rgba(34,197,94,0.12)", color: "#22c55e" },
  SCHEDULED: { bg: "rgba(249,115,22,0.12)", color: "#f97316" },
  LIVE: { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
}[s] || { bg: "rgba(255,255,255,0.05)", color: "#aaa" });

/* ─── component ─────────────────────────────────────────────────── */
function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOrganizer, user } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [teams, setTeams] = useState([]);          // all teams for name lookup
  const [players, setPlayers] = useState([]);      // all players for membership lookup
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [actionLoading, setActionLoading] = useState(false);
  const [joinTeamId, setJoinTeamId] = useState("");
  const [toast, setToast] = useState(null);

  const org = isOrganizer();

  /* ── fetch everything ─────────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    try {
      const [tRes, matchesRes, lbRes, teamsRes, playersRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/matches/tournament/${id}`),
        api.get(`/leaderboard/${id}`).catch(() => ({ data: [] })),
        api.get(`/teams`).catch(() => ({ data: [] })),
        api.get(`/players`).catch(() => ({ data: [] })),
      ]);
      setTournament(tRes.data);
      setMatches(matchesRes.data || []);
      setLeaderboard(lbRes.data || []);
      setTeams(teamsRes.data || []);
      setPlayers(playersRes.data || []);
    } catch (err) {
      console.error("Error fetching tournament detail:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── team name helper ─────────────────────────────────────────── */
  const teamName = (teamId) => {
    if (!teamId) return "TBD";
    const t = teams.find(t => t.id === teamId);
    return t ? t.name : teamId.slice(-6).toUpperCase();
  };

  /* ── find teams where the current user is a member ─────────── */
  const getMyTeams = () => {
    if (!user) return [];
    const uid = user.id || "";

    // Teams where the user is directly a member or the manager
    return teams.filter(t =>
      t.managerId === uid ||
      (t.playerIds && t.playerIds.includes(uid))
    );
  };

  const myTeams = getMyTeams();
  const availableMyTeams = myTeams.filter(t => !tournament?.teamIds?.includes(t.id));

  /* ── show toast ───────────────────────────────────────────────── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── start tournament ─────────────────────────────────────────── */
  const handleStart = async () => {
    if (!window.confirm("Lock registrations and auto-generate bracket matches?")) return;
    setActionLoading(true);
    try {
      await api.post(`/tournaments/${id}/start`);
      showToast("🏆 Tournament started! Bracket matches generated.");
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to start tournament.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── join tournament ──────────────────────────────────────────── */
  const handleJoin = async () => {
    if (!joinTeamId) return showToast("Select a team to join with.", "error");
    // Verify the team belongs to the user
    const isMyTeam = myTeams.some(t => t.id === joinTeamId);
    if (!isMyTeam) return showToast("You can only register your own team.", "error");
    setActionLoading(true);
    try {
      await api.post(`/tournaments/${id}/join`, { teamId: joinTeamId });
      showToast("✅ Team registered successfully!");
      setJoinTeamId("");
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to join tournament.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  /* ── guards ───────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Navbar />
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 52, height: 52, border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading tournament…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!tournament) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
      <Navbar />
      <h2>Tournament not found</h2>
    </div>
  );

  const sc = statusColor(tournament.status);
  const tabs = ["overview", "matches", "leaderboard"];

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 9999,
          padding: "12px 20px", borderRadius: "12px", fontWeight: 600, fontSize: "0.9rem",
          background: toast.type === "error" ? "rgba(239,68,68,0.9)" : "rgba(34,197,94,0.9)",
          color: "white", boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          animation: "slideIn 0.3s ease",
        }}>
          {toast.msg}
        </div>
      )}

      <Navbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px 60px" }}>

        {/* ── HERO HEADER ─────────────────────────────────────────── */}
        <div style={{
          background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(249,115,22,0.04) 100%)",
          border: "1px solid var(--border)",
          borderRadius: 24,
          padding: "2.5rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}>
          {/* background glow */}
          <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)", pointerEvents: "none" }} />

          {/* top-right actions */}
          <div style={{ position: "absolute", top: "1.5rem", right: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{ padding: "5px 14px", borderRadius: 8, background: sc.bg, color: sc.color, fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.08em", border: `1px solid ${sc.border}` }}>
              {tournament.status}
            </span>
            {org && !tournament.locked && (
              <button
                onClick={handleStart}
                disabled={actionLoading}
                style={{ padding: "8px 18px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.85rem", opacity: actionLoading ? 0.7 : 1 }}
              >
                {actionLoading ? "Starting…" : "🚀 Start Tournament"}
              </button>
            )}
            {org && (
              <Link to={`/schedule-match?t=${id}`}
                style={{ padding: "8px 18px", background: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "1px solid #8b5cf640", borderRadius: 10, fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>
                + Schedule Match
              </Link>
            )}
          </div>

          {/* title */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "3rem" }}>{tournament.gameIcon || "🎮"}</span>
            <div>
              <h1 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "clamp(1.6rem,4vw,2.6rem)", fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
                {tournament.name}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.45)", margin: "6px 0 0", fontSize: "0.9rem", maxWidth: 600 }}>
                {tournament.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* meta grid */}
          <div style={{ display: "flex", gap: "2.5rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
            <MetaItem label="GAME ENGINE" value={tournament.game} />
            <MetaItem label="FORMAT" value={tournament.format || "Standard"} />
            <MetaItem label="PRIZE POOL" value={tournament.prizePool ? `₹${tournament.prizePool}` : "—"} color="#22c55e" />
            <MetaItem label="REGION" value={tournament.region || "Global"} />
            <MetaItem label="TEAMS" value={`${tournament.teamIds?.length || 0} / ${tournament.maxTeams || "∞"}`} />
            <MetaItem label="MATCHES" value={matches.length} />
          </div>

          {/* join tournament (players only, not started yet, must be on a team) */}
          {!org && !tournament.locked && (
            <div style={{ marginTop: "1.75rem" }}>
              {!user ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
                  padding: "14px 20px", background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12,
                }}>
                  <span style={{ fontSize: "1.25rem" }}>👋</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#a78bfa", fontSize: "0.9rem" }}>
                      Login to Compete
                    </p>
                    <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
                      Sign in or create an account to register your team for this tournament.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    style={{ padding: "8px 18px", background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", marginLeft: "auto" }}
                  >
                    Login to Join
                  </button>
                </div>
              ) : myTeams.length === 0 ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
                  padding: "14px 20px", background: "rgba(249,115,22,0.08)",
                  border: "1px solid rgba(249,115,22,0.2)", borderRadius: 12,
                }}>
                  <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#f97316", fontSize: "0.9rem" }}>
                      You are not part of any team yet
                    </p>
                    <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>
                      Join a team first from the Teams page, then come back to register for this tournament.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/teams")}
                    style={{ padding: "8px 18px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", marginLeft: "auto" }}
                  >
                    Browse Teams
                  </button>
                </div>
              ) : availableMyTeams.length === 0 ? (
                <div style={{
                  padding: "14px 20px", background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12,
                  display: "flex", alignItems: "center", gap: "0.75rem",
                }}>
                  <span style={{ fontSize: "1.25rem" }}>✅</span>
                  <p style={{ margin: 0, fontWeight: 600, color: "#22c55e", fontSize: "0.88rem" }}>
                    All your teams are already registered in this tournament!
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={joinTeamId}
                    onChange={e => setJoinTeamId(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 16px", color: "white", fontSize: "0.9rem", flex: "1 1 200px", maxWidth: 320 }}
                  >
                    <option value="">— Select your team —</option>
                    {availableMyTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading}
                    style={{ padding: "10px 22px", background: "linear-gradient(135deg,#f97316,#8b5cf6)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}
                  >
                    {actionLoading ? "Joining…" : "Join Tournament"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── TABS ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 22px", border: "none", borderRadius: 10, cursor: "pointer",
                fontWeight: 700, fontSize: "0.85rem", textTransform: "capitalize", letterSpacing: "0.03em",
                background: activeTab === tab ? "linear-gradient(135deg,#f97316,#ea580c)" : "rgba(255,255,255,0.05)",
                color: activeTab === tab ? "white" : "rgba(255,255,255,0.5)",
                transition: "all 0.2s",
                boxShadow: activeTab === tab ? "0 4px 15px rgba(249,115,22,0.3)" : "none",
              }}
            >
              {tab === "overview" && "📋 "}
              {tab === "matches" && "⚔️ "}
              {tab === "leaderboard" && "🏆 "}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {/* Registered Teams */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "1.75rem" }}>
              <h3 style={{ fontFamily: "'Exo 2', sans-serif", marginBottom: "1.25rem", fontSize: "1rem", color: "rgba(255,255,255,0.7)" }}>
                👥 Registered Teams ({tournament.teamIds?.length || 0})
              </h3>
              {(!tournament.teamIds || tournament.teamIds.length === 0) ? (
                <EmptyState label="No teams registered yet." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {tournament.teamIds.map((tid, i) => (
                    <div key={tid} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ width: 24, height: 24, background: "rgba(249,115,22,0.15)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, color: "#f97316" }}>{i + 1}</span>
                      <span style={{ fontWeight: 600 }}>{teamName(tid)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tournament Info */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "1.75rem" }}>
              <h3 style={{ fontFamily: "'Exo 2', sans-serif", marginBottom: "1.25rem", fontSize: "1rem", color: "rgba(255,255,255,0.7)" }}>
                📊 Tournament Info
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {[
                  { label: "Format", value: tournament.format },
                  { label: "Game", value: tournament.game },
                  { label: "Max Teams", value: tournament.maxTeams || "Unlimited" },
                  { label: "Region", value: tournament.region || "Global" },
                  { label: "Start Date", value: tournament.startDate ? new Date(tournament.startDate).toLocaleString() : "TBD" },
                  { label: "Status", value: tournament.status },
                  { label: "Registration", value: tournament.locked ? "Closed" : "Open" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "0.65rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", fontWeight: 600 }}>{label}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem" }}>{value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ MATCHES TAB ═══════════════════════════════════════════ */}
        {activeTab === "matches" && (
          <div>
            {matches.length === 0 ? (
              <div style={{ textAlign: "center", padding: "5rem 2rem", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 20, color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚔️</div>
                <p style={{ fontWeight: 600 }}>No matches scheduled yet.</p>
                {org && <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Start the tournament to auto-generate bracket matches, or use "Schedule Match" to add manually.</p>}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {matches.map(match => {
                  const mss = matchStatusStyle(match.status);
                  const t1 = match.teamIds?.[0];
                  const t2 = match.teamIds?.[1];
                  return (
                    <div key={match.id} style={{
                      background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18,
                      borderLeft: `4px solid ${match.status === "COMPLETED" ? "#22c55e" : "#f97316"}`,
                      padding: "1.5rem 2rem",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      flexWrap: "wrap", gap: "1rem",
                      transition: "transform 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}
                    >
                      {/* Round + Teams */}
                      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                        <div style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block" }}>Round</span>
                          <span style={{ fontWeight: 900, fontSize: "1.3rem", color: "#f97316" }}>{match.round || 1}</span>
                        </div>
                        <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 800, fontSize: "clamp(1rem,2.5vw,1.3rem)" }}>
                          <span style={{ color: "#fff" }}>{teamName(t1)}</span>
                          <span style={{ color: "rgba(255,255,255,0.25)", margin: "0 0.75rem" }}>VS</span>
                          <span style={{ color: "#fff" }}>{t2 ? teamName(t2) : "TBD"}</span>
                        </div>
                      </div>

                      {/* Status + Score + Action */}
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        {match.status === "COMPLETED" ? (
                          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ display: "inline-block", padding: "3px 10px", background: mss.bg, color: mss.color, borderRadius: 6, fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.06em" }}>
                                COMPLETED
                              </span>
                              <Link to={`/matches/${match.id}/result-page`} style={{ fontSize: "0.75rem", color: "#f97316", fontWeight: 700, textDecoration: "none", background: "rgba(249,115,22,0.1)", padding: "3px 8px", borderRadius: 4 }}>
                                View Results 🏆
                              </Link>
                            </div>
                            {match.winnerTeamId && (
                              <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>
                                🏆 Winner: <strong style={{ color: "#22c55e" }}>{teamName(match.winnerTeamId)}</strong>
                              </p>
                            )}
                            {match.finalScore && (
                              <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                                {Object.entries(match.finalScore).map(([tid, sc]) => `${teamName(tid)}: ${sc}`).join("  |  ")}
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <span style={{ padding: "3px 10px", background: mss.bg, color: mss.color, borderRadius: 6, fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.06em" }}>
                              SCHEDULED
                            </span>
                            {match.scheduledAt && (
                              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)" }}>
                                {new Date(match.scheduledAt).toLocaleDateString()}
                              </span>
                            )}
                            {org && (
                              <button
                                onClick={() => navigate(`/matches/${match.id}/submit`)}
                                style={{ padding: "8px 16px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}
                              >
                                Submit Result
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ LEADERBOARD TAB ═══════════════════════════════════════ */}
        {activeTab === "leaderboard" && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: "center", padding: "5rem 2rem", color: "rgba(255,255,255,0.3)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
                <p style={{ fontWeight: 600 }}>No standings yet. Complete matches to see results here.</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Rank", "Team", "Played", "Wins", "Total Score"].map(h => (
                      <th key={h} style={{ padding: "1rem 1.5rem", textAlign: h === "Total Score" ? "right" : "left", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, i) => {
                    const rankColors = ["#f59e0b", "#9ca3af", "#b45309"];
                    const rankEmojis = ["🥇", "🥈", "🥉"];
                    const isTop3 = i < 3;
                    return (
                      <tr
                        key={entry.teamId}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          background: i === 0 ? "rgba(245,158,11,0.04)" : "transparent",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={e => e.currentTarget.style.background = i === 0 ? "rgba(245,158,11,0.04)" : "transparent"}
                      >
                        <td style={{ padding: "1.2rem 1.5rem" }}>
                          <span style={{ fontWeight: 900, color: isTop3 ? rankColors[i] : "rgba(255,255,255,0.4)", fontSize: "1rem" }}>
                            {isTop3 ? rankEmojis[i] : `#${entry.rank}`}
                          </span>
                        </td>
                        <td style={{ padding: "1.2rem 1.5rem", fontWeight: 700 }}>
                          {entry.teamName || teamName(entry.teamId)}
                        </td>
                        <td style={{ padding: "1.2rem 1.5rem", color: "rgba(255,255,255,0.55)" }}>{entry.matchesPlayed}</td>
                        <td style={{ padding: "1.2rem 1.5rem", color: "#22c55e", fontWeight: 700 }}>{entry.wins}</td>
                        <td style={{ padding: "1.2rem 1.5rem", textAlign: "right", color: "#f97316", fontWeight: 900, fontSize: "1.2rem" }}>
                          {entry.totalScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */
const MetaItem = ({ label, value, color }) => (
  <div>
    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", display: "block" }}>{label}</span>
    <p style={{ fontWeight: 800, margin: "4px 0 0", color: color || "#fff", fontSize: "1rem" }}>{value ?? "—"}</p>
  </div>
);

const EmptyState = ({ label }) => (
  <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.2)", fontSize: "0.85rem" }}>{label}</div>
);

export default TournamentDetails;