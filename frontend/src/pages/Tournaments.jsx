import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";

const STATUS_COLORS = {
  LIVE: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", border: "#ef444440" },
  UPCOMING: { bg: "rgba(249,115,22,0.12)", color: "#f97316", border: "#f9731640" },
  COMPLETED: { bg: "rgba(139,92,246,0.12)", color: "#8b5cf6", border: "#8b5cf640" },
};

function Tournaments() {
  const navigate = useNavigate();
  const { isOrganizer } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const org = isOrganizer();

  useEffect(() => {
    api.get("/tournaments")
      .then(res => setTournaments(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.game && t.game.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "100px 24px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "2.2rem", fontWeight: 900, marginBottom: "0.25rem" }}>
              🏆 Tournaments
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", margin: 0 }}>Browse and compete in the best esports events</p>
          </div>
          {org && (
            <Link
              to="/create-tournament"
              style={{ padding: "12px 24px", background: "linear-gradient(135deg,#f97316,#ea580c)", color: "white", borderRadius: 12, fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(249,115,22,0.3)", display: "flex", alignItems: "center", gap: "8px" }}
            >
              + Create Tournament
            </Link>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="🔍  Search by name or game..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: "1 1 240px", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: "0.9rem", outline: "none" }}
          />
          {["all", "UPCOMING", "LIVE", "COMPLETED"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{ padding: "12px 18px", borderRadius: 10, border: "1px solid", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", borderColor: filterStatus === s ? "#f97316" : "rgba(255,255,255,0.1)", background: filterStatus === s ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)", color: filterStatus === s ? "#f97316" : "rgba(255,255,255,0.45)", transition: "all 0.2s" }}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.5rem" }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} style={{ height: 220, background: "var(--bg-card)", borderRadius: 20, border: "1px solid var(--border)", animation: "pulse 1.5s ease infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", color: "rgba(255,255,255,0.2)" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏜️</div>
            <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.5rem" }}>No tournaments found</h3>
            <p style={{ fontSize: "0.9rem" }}>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.5rem" }}>
            {filtered.map(t => {
              const sc = STATUS_COLORS[t.status] || STATUS_COLORS.UPCOMING;
              return (
                <div
                  key={t.id}
                  onClick={() => navigate(`/tournaments/${t.id}`)}
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", cursor: "pointer", transition: "all 0.25s", position: "relative" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.border = "1px solid rgba(249,115,22,0.4)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.border = "1px solid var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Banner */}
                  <div style={{ height: 100, background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(139,92,246,0.08))", display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "1.25rem" }}>
                    <span style={{ fontSize: "3rem", lineHeight: 1 }}>{t.gameIcon || "🏆"}</span>
                    <span style={{ padding: "4px 12px", borderRadius: 8, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em" }}>
                      {t.status}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "1.25rem 1.5rem" }}>
                    <h3 style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.25rem", lineHeight: 1.2 }}>{t.name}</h3>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem", margin: 0 }}>{t.game} {t.format ? `• ${t.format}` : ""}</p>

                    <div style={{ display: "flex", gap: "2rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Teams</span>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.teamIds?.length || 0} / {t.maxTeams || "∞"}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Prize</span>
                        <span style={{ fontWeight: 700, color: "#22c55e", fontSize: "0.95rem" }}>{t.prizePool || "FREE"}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Region</span>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.region || "Global"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

export default Tournaments;