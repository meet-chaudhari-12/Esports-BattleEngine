import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer style={{
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border)",
            padding: "5rem 24px 2rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Subtle Background Glow */}
            <div style={{
                position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                width: "60%", height: "100px",
                background: "radial-gradient(ellipse at top, rgba(249,115,22,0.08) 0%, transparent 70%)",
                pointerEvents: "none"
            }} />

            <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "3rem",
                    marginBottom: "4rem"
                }}>
                    {/* Brand & About */}
                    <div>
                        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "1.5rem" }}>
                            <div style={{
                                width: "40px", height: "40px",
                                background: "linear-gradient(135deg, #f97316, #8b5cf6)",
                                borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.2rem", boxShadow: "0 4px 15px rgba(249,115,22,0.3)",
                            }}>
                                ⚡
                            </div>
                            <span style={{
                                fontFamily: "'Exo 2', sans-serif", fontSize: "1.5rem", fontWeight: 900,
                                background: "linear-gradient(135deg, #f97316, #8b5cf6)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                            }}>
                                BattleEngine
                            </span>
                        </Link>
                        <p style={{ lineHeight: "1.7", fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", marginBottom: "1.5rem" }}>
                            The ultimate multi-game esports platform. Build your legacy, compete in high-stakes tournaments, and climb the global leaderboards.
                        </p>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            {["𝕏", "👾", "📺", "📸"].map((icon, i) => (
                                <a key={i} href="#" style={{
                                    width: "36px", height: "36px", borderRadius: "8px",
                                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "rgba(255,255,255,0.6)", textDecoration: "none",
                                    transition: "all 0.2s"
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-glow)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "var(--primary)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                                >
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h3 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Platform
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {["Tournaments", "Leaderboards", "Teams & Squads", "Live Matches", "News & Updates"].map(item => (
                                <li key={item}>
                                    <Link to={`/${item.toLowerCase().split(' ')[0]}`} style={{
                                        color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s"
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community Links */}
                    <div>
                        <h3 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Community
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {["Discord Server", "Support Center", "API Documentation", "Become an Organizer", "Brand Assets"].map(item => (
                                <li key={item}>
                                    <Link to="#" style={{
                                        color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s"
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 style={{ fontFamily: "'Exo 2', sans-serif", fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            Stay Updated
                        </h3>
                        <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.45)", marginBottom: "1rem", lineHeight: "1.6" }}>
                            Get the latest news, tournament announcements, and patch notes.
                        </p>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input type="email" placeholder="Enter your email" style={{
                                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                                padding: "0.75rem 1rem", borderRadius: "10px", color: "#fff", flex: 1, outline: "none",
                                fontSize: "0.9rem", transition: "border 0.2s"
                            }}
                                onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
                                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                            />
                            <button style={{
                                background: "linear-gradient(135deg, var(--primary), #ea580c)", border: "none",
                                borderRadius: "10px", padding: "0 1.25rem", color: "#fff", fontWeight: 700,
                                cursor: "pointer", transition: "transform 0.2s"
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                            >
                                Go
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem",
                    paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)",
                    fontSize: "0.85rem", color: "rgba(255,255,255,0.35)"
                }}>
                    <p>&copy; {new Date().getFullYear()} BattleEngine. All rights reserved.</p>
                    <div style={{ display: "flex", gap: "2rem" }}>
                        <Link to="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>Privacy Policy</Link>
                        <Link to="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>Terms of Service</Link>
                        <Link to="#" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "#fff"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
