import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api/axios";

function Home() {
  const [activeTab, setActiveTab] = useState("all");
  const [scrolled, setScrolled] = useState(false);
  const [games, setGames] = useState([]);
  const [liveTournaments, setLiveTournaments] = useState([]);
  const [stats, setStats] = useState([
    { label: "Active Players", value: "2.4M+", icon: "🎮" },
    { label: "Tournaments Held", value: "0+", icon: "🏆" },
    { label: "Prize Distributed", value: "₹12 Cr", icon: "💰" },
    { label: "Games Supported", value: "0+", icon: "🕹️" },
  ]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });

    const fetchData = async () => {
      try {
        const [gamesRes, tournamentsRes] = await Promise.all([
          api.get("/rules").catch(() => ({ data: [] })),
          api.get("/tournaments").catch(() => ({ data: [] }))
        ]);

        const gamesData = Array.isArray(gamesRes.data) ? gamesRes.data : [];
        const tournamentsData = Array.isArray(tournamentsRes.data) ? tournamentsRes.data : [];

        setGames(gamesData);

        const live = tournamentsData.filter(t => t?.status === "LIVE" || t?.status === "OPEN");
        setLiveTournaments(live.slice(0, 4));

        setStats([
          { label: "Active Players", value: "2.4M+", icon: "🎮" },
          { label: "Tournaments Held", value: `${tournamentsData.length}+`, icon: "🏆" },
          { label: "Prize Distributed", value: "₹12 Cr", icon: "💰" },
          { label: "Games Supported", value: `${gamesData.length}+`, icon: "🕹️" }
        ]);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    };

    fetchData();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredGames = activeTab === "all"
    ? games
    : games.filter(g => g?.genre?.toLowerCase().includes(activeTab.toLowerCase()));

  const gameTabs = [{ id: "all", label: "All Games" }];
  const uniqueGenres = [...new Set(games.map(g => g?.genre).filter(Boolean))];
  uniqueGenres.forEach(genre => {
    gameTabs.push({ id: String(genre).toLowerCase(), label: genre });
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "white" }}>
      <Navbar />

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={heroOverlayStyle} />
        <div style={heroGridStyle} />

        <div style={{ position: "relative", maxWidth: "860px", zIndex: 1, padding: "0 20px" }}>
          <div style={heroBadgeStyle}>
            <span className="pulse-dot" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fc8181", letterSpacing: "0.05em" }}>
              {liveTournaments.length > 0 ? `${liveTournaments.length} TOURNAMENTS LIVE NOW` : "COMPETE ON THE EDGE"}
            </span>
          </div>

          <h1 style={heroH1Style}>
            Compete. <span className="text-gradient">Dominate.</span> Conquer.
          </h1>

          <p style={heroPStyle}>
            India's most powerful esports tournament platform. Multi-game scoring engine for Battle Royale, Tactical Shooters, Racing and Sports.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/login?role=player" className="btn btn-primary btn-lg btn-xl">🎮 Join as Player</Link>
            <Link to="/login?role=organizer" className="btn btn-outline btn-lg btn-xl">🏆 Host as Organizer</Link>
          </div>

          <div style={heroStatsStyle}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div className="text-gradient" style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "1.6rem", fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: "2px", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Tournaments */}
      {liveTournaments.length > 0 && (
        <section style={{ padding: "80px 24px", background: "var(--bg-surface)", borderTop: "1px solid var(--border)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <h2 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "2rem", fontWeight: 800, marginBottom: "2rem" }}>
              🔴 Live & Open Tournaments
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {liveTournaments.map(t => (
                <TournamentRow key={t.id} t={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Games Section */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Explore Game Engines
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Dynamic scoring for every genre</p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
            {gameTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: "30px",
                  border: "1px solid var(--border)",
                  background: activeTab === tab.id ? "var(--primary)" : "rgba(255,255,255,0.05)",
                  color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.5)",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "2rem",
          }}>
            {filteredGames.length > 0 ? filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            )) : (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
                No games found in this category.
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #ef4444;
          box-shadow: 0 0 8px #ef4444; animation: pulse 1.5s ease infinite;
          display: inline-block; margin-right: 8px;
        }
        .text-gradient {
          background: linear-gradient(135deg, #f97316, #8b5cf6);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-btn-player { background: var(--primary); color: white; padding: 1rem 2rem; border-radius: 12px; font-weight: 700; text-decoration: none; }
        .hero-btn-organizer { border: 1px solid var(--border); color: white; padding: 1rem 2rem; border-radius: 12px; font-weight: 700; text-decoration: none; }
        .progress-bg { width: 100px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .progress-bar { height: 100%; transition: width 0.3s ease; }
      `}</style>
    </div>
  );
}

function GameCard({ game }) {
  const [hovered, setHovered] = useState(false);
  const color = game.color || "#f97316";
  const gradient = game.gradient || "linear-gradient(135deg, #1a0a00, #2d1a00)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: gradient,
        border: `1px solid ${hovered ? color + "60" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "20px",
        padding: "2rem",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.6), 0 0 30px ${color}20` : "0 4px 16px rgba(0,0,0,0.3)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>{game.icon || "🎮"}</div>
      <h3 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem" }}>{game.fullName || game.gameName}</h3>
      <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem" }}>{game.genre}</p>
      <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Engine</div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color: color }}>{game.gameName}</div>
    </div>
  );
}

function TournamentRow({ t }) {
  const enrolled = t.teamIds?.length || 0;
  const maxSlots = t.maxTeams || 100;
  const pct = Math.round((enrolled / maxSlots) * 100);
  const color = "#f97316";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.25rem 2rem",
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "16px", transition: "all 0.2s"
    }}>
      <span style={{ fontSize: "2rem" }}>{t.gameIcon || "🎯"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>{t.name}</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "4px", background: "var(--primary-glow)", color: "var(--primary)" }}>{t.status}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className="progress-bg"><div className="progress-bar" style={{ width: `${pct}%`, background: color }}></div></div>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{enrolled}/{maxSlots} Teams</span>
        </div>
      </div>
      <Link to={`/tournaments/${t.id}`} className="btn btn-primary btn-sm">Join Tournament</Link>
    </div>
  );
}

// Styles
const heroSectionStyle = {
  minHeight: "100vh", display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center", position: "relative",
  overflow: "hidden", padding: "100px 24px 60px", textAlign: "center",
};

const heroOverlayStyle = {
  position: "absolute", inset: 0,
  background: "radial-gradient(ellipse at 60% 30%, rgba(249,115,22,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(139,92,246,0.1) 0%, transparent 60%)",
  pointerEvents: "none",
};

const heroGridStyle = {
  position: "absolute", inset: 0,
  backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
  backgroundSize: "60px 60px", pointerEvents: "none",
};

const heroBadgeStyle = {
  display: "inline-flex", alignItems: "center",
  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: "30px", padding: "6px 16px", marginBottom: "2.5rem",
};

const heroH1Style = {
  fontFamily: "'Exo 2', sans-serif", fontSize: "clamp(2.5rem, 8vw, 5.5rem)",
  fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: "2rem",
};

const heroPStyle = {
  fontSize: "clamp(1rem, 2.5vw, 1.25rem)", color: "rgba(255,255,255,0.5)",
  maxWidth: "650px", margin: "0 auto 3rem", lineHeight: "1.7",
};

const heroStatsStyle = {
  display: "flex", gap: "3rem", justifyContent: "center",
  marginTop: "4rem", flexWrap: "wrap",
};

export default Home;
