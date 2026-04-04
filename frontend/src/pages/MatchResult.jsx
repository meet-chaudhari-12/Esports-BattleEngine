import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

/* ── rank medal helpers ───────────────────────────────────── */
const MEDAL = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#f59e0b", "#9ca3af", "#b45309"];

function MatchResult() {
    const { id } = useParams();             // match ID
    const navigate = useNavigate();

    const [matchResult, setMatchResult] = useState(null);   // MatchResultResponse
    const [tournament, setTournament] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [teams, setTeams] = useState([]);      // for name lookup in lb
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("match"); // "match" | "standings"

    useEffect(() => {
        const load = async () => {
            try {
                // 1) Fetch match result (rich response with per-team leaderboard)
                const mrRes = await api.get(`/matches/${id}/result`);
                const mr = mrRes.data;
                setMatchResult(mr);

                // 2) Fetch tournament + leaderboard + teams in parallel
                const [tRes, lbRes, teamsRes] = await Promise.all([
                    api.get(`/tournaments/${mr.tournamentId}`).catch(() => ({ data: null })),
                    api.get(`/leaderboard/${mr.tournamentId}`).catch(() => ({ data: [] })),
                    api.get(`/teams`).catch(() => ({ data: [] })),
                ]);
                setTournament(tRes.data);
                setLeaderboard(lbRes.data || []);
                setTeams(teamsRes.data || []);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Could not load match result.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const teamName = (teamId) => {
        if (!teamId) return "—";
        const t = teams.find(t => t.id === teamId);
        return t ? t.name : teamId.slice(-6).toUpperCase();
    };

    /* ── loading / error ────────────────────────────────────── */
    if (loading) return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Navbar />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ textAlign: "center" }}>
                <div style={{ width: 52, height: 52, border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
                <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading match result…</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <Navbar />
            <span style={{ fontSize: "3rem" }}>⚠️</span>
            <p style={{ color: "#f87171", fontWeight: 600 }}>{error}</p>
            <button onClick={() => navigate(-1)} style={{ padding: "10px 24px", background: "#f97316", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>Go Back</button>
        </div>
    );

    const winner = matchResult?.matchLeaderboard?.[0];
    const gameEmoji = { BGMI: "🔫", VALORANT: "🎯", "Free Fire": "🔥", "CS:GO": "💣", F1_23: "🏎️", "League of Legends": "⚔️", "Dota 2": "🐉" }[matchResult?.game] || "🎮";

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
            <Navbar />

            <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 24px 80px" }}>

                {/* ── Breadcrumb ── */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.3)", marginBottom: "1.5rem" }}>
                    <Link to="/tournaments" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Tournaments</Link>
                    <span>›</span>
                    {tournament && (
                        <>
                            <Link to={`/tournaments/${tournament.id}`} style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>{tournament.name}</Link>
                            <span>›</span>
                        </>
                    )}
                    <span style={{ color: "#f97316" }}>Match Result</span>
                </div>

                {/* ── Winner Banner ── */}
                {matchResult?.winnerTeamName && (
                    <div style={{
                        background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(249,115,22,0.08) 50%, rgba(139,92,246,0.08) 100%)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: 24,
                        padding: "2.5rem",
                        textAlign: "center",
                        marginBottom: "2rem",
                        position: "relative",
                        overflow: "hidden",
                    }}>
                        {/* confetti-like glow */}
                        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.12), transparent 70%)", pointerEvents: "none" }} />
                        <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>🏆</div>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "0.5rem" }}>
                            {gameEmoji} {matchResult.game} · Round {matchResult.round || 1}
                        </p>
                        <h1 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 900, color: "#f59e0b", margin: "0 0 0.25rem" }}>
                            {matchResult.winnerTeamName}
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: "1rem" }}>🥇 Match Winner</p>
                    </div>
                )}

                {/* ── Tabs ── */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {[
                        { key: "match", label: "⚔️ Match Leaderboard" },
                        { key: "standings", label: "🏆 Tournament Standings" },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: "10px 22px", border: "none", borderRadius: 10, cursor: "pointer",
                                fontWeight: 700, fontSize: "0.85rem", transition: "all 0.2s",
                                background: activeTab === tab.key ? "linear-gradient(135deg,#f97316,#ea580c)" : "rgba(255,255,255,0.05)",
                                color: activeTab === tab.key ? "white" : "rgba(255,255,255,0.45)",
                                boxShadow: activeTab === tab.key ? "0 4px 15px rgba(249,115,22,0.3)" : "none",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ══ MATCH LEADERBOARD TAB ══════════════════════════════ */}
                {activeTab === "match" && (
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
                        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", margin: 0 }}>
                                {gameEmoji} Match Scores — Round {matchResult?.round || 1}
                            </h2>
                            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
                                {matchResult?.matchLeaderboard?.length || 0} teams
                            </span>
                        </div>

                        {(!matchResult?.matchLeaderboard || matchResult.matchLeaderboard.length === 0) ? (
                            <div style={{ padding: "4rem", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>
                                No scores available for this match.
                            </div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                                        {["Rank", "Team", "Score", "Result"].map(h => (
                                            <th key={h} style={{ padding: "1rem 1.75rem", textAlign: h === "Score" || h === "Result" ? "right" : "left", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {matchResult.matchLeaderboard.map((entry, i) => (
                                        <tr
                                            key={entry.teamId}
                                            style={{
                                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                background: entry.isWinner ? "rgba(245,158,11,0.06)" : "transparent",
                                                transition: "background 0.2s",
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = entry.isWinner ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)"}
                                            onMouseLeave={e => e.currentTarget.style.background = entry.isWinner ? "rgba(245,158,11,0.06)" : "transparent"}
                                        >
                                            {/* Rank */}
                                            <td style={{ padding: "1.4rem 1.75rem" }}>
                                                <span style={{ fontWeight: 900, fontSize: "1.2rem", color: i < 3 ? RANK_COLORS[i] : "rgba(255,255,255,0.35)" }}>
                                                    {i < 3 ? MEDAL[i] : `#${entry.rank}`}
                                                </span>
                                            </td>

                                            {/* Team Name */}
                                            <td style={{ padding: "1.4rem 1.75rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: entry.isWinner ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>
                                                        {entry.isWinner ? "🏆" : "🎮"}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>{entry.teamName}</p>
                                                        {entry.isWinner && (
                                                            <span style={{ fontSize: "0.68rem", color: "#f59e0b", fontWeight: 700 }}>WINNER</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Score */}
                                            <td style={{ padding: "1.4rem 1.75rem", textAlign: "right" }}>
                                                <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 900, fontSize: "1.6rem", color: entry.isWinner ? "#f59e0b" : "#f97316" }}>
                                                    {entry.score}
                                                </span>
                                                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>pts</span>
                                            </td>

                                            {/* Result badge */}
                                            <td style={{ padding: "1.4rem 1.75rem", textAlign: "right" }}>
                                                <span style={{
                                                    padding: "4px 12px", borderRadius: 8, fontWeight: 800, fontSize: "0.72rem", letterSpacing: "0.06em",
                                                    background: entry.isWinner ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.08)",
                                                    color: entry.isWinner ? "#22c55e" : "#f87171",
                                                    border: `1px solid ${entry.isWinner ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
                                                }}>
                                                    {entry.isWinner ? "WIN" : "LOSS"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ══ TOURNAMENT STANDINGS TAB ═════════════════════════ */}
                {activeTab === "standings" && (
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
                        <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", margin: 0 }}>
                                🏆 {tournament?.name || "Tournament"} — Overall Standings
                            </h2>
                            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
                                {leaderboard.length} teams ranked
                            </span>
                        </div>

                        {leaderboard.length === 0 ? (
                            <div style={{ padding: "4rem", textAlign: "center", color: "rgba(255,255,255,0.25)" }}>
                                <p>No standings yet. More matches need to be completed.</p>
                            </div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                                        {["Rank", "Team", "Played", "Wins", "Total Score"].map(h => (
                                            <th key={h} style={{ padding: "1rem 1.75rem", textAlign: h === "Total Score" ? "right" : "left", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((entry, i) => (
                                        <tr
                                            key={entry.teamId}
                                            style={{
                                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                                background: i === 0 ? "rgba(245,158,11,0.05)" : "transparent",
                                                transition: "background 0.2s",
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                            onMouseLeave={e => e.currentTarget.style.background = i === 0 ? "rgba(245,158,11,0.05)" : "transparent"}
                                        >
                                            <td style={{ padding: "1.2rem 1.75rem" }}>
                                                <span style={{ fontWeight: 900, fontSize: "1.1rem", color: i < 3 ? RANK_COLORS[i] : "rgba(255,255,255,0.35)" }}>
                                                    {i < 3 ? MEDAL[i] : `#${entry.rank}`}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1.2rem 1.75rem", fontWeight: 700, fontSize: "0.95rem" }}>
                                                {entry.teamName || teamName(entry.teamId)}
                                            </td>
                                            <td style={{ padding: "1.2rem 1.75rem", color: "rgba(255,255,255,0.5)" }}>{entry.matchesPlayed}</td>
                                            <td style={{ padding: "1.2rem 1.75rem" }}>
                                                <span style={{ color: "#22c55e", fontWeight: 700 }}>{entry.wins}</span>
                                                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem" }}> W</span>
                                            </td>
                                            <td style={{ padding: "1.2rem 1.75rem", textAlign: "right" }}>
                                                <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "#f97316" }}>
                                                    {entry.totalScore}
                                                </span>
                                                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", marginLeft: 4 }}>pts</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ── Bottom CTA ── */}
                <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
                    {tournament && (
                        <Link
                            to={`/tournaments/${tournament.id}`}
                            style={{ padding: "12px 24px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "white", borderRadius: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 15px rgba(249,115,22,0.3)" }}
                        >
                            ← Back to Tournament
                        </Link>
                    )}
                    <Link
                        to="/tournaments"
                        style={{ padding: "12px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}
                    >
                        All Tournaments
                    </Link>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default MatchResult;
