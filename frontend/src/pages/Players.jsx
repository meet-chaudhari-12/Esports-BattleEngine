import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function Players() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [expandedTeams, setExpandedTeams] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    inGameName: "",
    role: "",
    country: "",
    age: "",
    teamId: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        api.get("/players"),
        api.get("/teams")
      ]);
      setPlayers(playersRes.data || []);
      setTeams(teamsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.inGameName.trim()) {
      alert("Name and IGN are required");
      return;
    }

    try {
      const playerData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };

      await api.post("/players", playerData);
      alert("Player created successfully!");
      setShowCreateModal(false);
      setFormData({
        name: "",
        inGameName: "",
        role: "",
        country: "",
        age: "",
        teamId: ""
      });
      fetchData();
    } catch (error) {
      console.error("Error creating player:", error);
      alert(error.response?.data?.message || "Failed to create player");
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (!confirm(`Are you sure you want to delete "${playerName}"?`)) {
      return;
    }

    try {
      await api.delete(`/players/${playerId}`);
      alert("Player deleted successfully!");
      fetchData();
    } catch (error) {
      console.error("Error deleting player:", error);
      alert(error.response?.data?.message || "Failed to delete player");
    }
  };

  const toggleTeamExpand = (teamId) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  // Get players for a specific team
  const getTeamPlayers = (team) => {
    return players.filter(p => {
      // Match by team's playerIds list or by player's teamId
      const inPlayerIds = team.playerIds && team.playerIds.includes(p.id);
      const hasTeamId = p.teamId === team.id;
      return inPlayerIds || hasTeamId;
    });
  };

  // Get free agents (players not in any team)
  const getFreeAgents = () => {
    const allTeamPlayerIds = teams.flatMap(t => t.playerIds || []);
    return players.filter(p => {
      const notInAnyTeamPlayerIds = !allTeamPlayerIds.includes(p.id);
      const noTeamId = !p.teamId;
      return notInAnyTeamPlayerIds && noTeamId;
    });
  };

  const freeAgents = getFreeAgents();

  // Filter teams based on search & region
  const filteredTeams = teams.filter(team => {
    const teamPlayers = getTeamPlayers(team);
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.org && team.org.toLowerCase().includes(searchTerm.toLowerCase())) ||
      teamPlayers.some(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.inGameName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesRegion = filterRegion === "all" || team.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  // Check if free agents match the search
  const filteredFreeAgents = freeAgents.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.inGameName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const regions = [...new Set(teams.map(t => t.region).filter(Boolean))];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
        <Navbar />
        <div style={{ paddingTop: "70px", position: "relative", zIndex: 1 }}>
          <div className="container" style={{ padding: "2rem 24px" }}>
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading teams & players...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <Navbar />
      <div style={{ paddingTop: "70px", position: "relative", zIndex: 1 }}>
        <div className="container" style={{ padding: "2rem 24px" }}>
          <div className="card">
            <div className="card-header" style={{ display: "block", borderBottom: "none", paddingBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.25rem" }}>
                <h1 className="card-title" style={{ margin: 0, fontSize: "1.6rem" }}>Teams & Players</h1>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Add Player
                </button>
              </div>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                Browse all teams and their rosters
              </p>
            </div>

            {/* Stats Bar */}
            <div style={{
              padding: "0.75rem 1.5rem",
              display: "flex",
              gap: "2rem",
              borderBottom: "1px solid var(--border)",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem"
                }}>👥</span>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f97316" }}>{teams.length}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Teams</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem"
                }}>🎮</span>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#8b5cf6" }}>{players.length}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Players</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.9rem"
                }}>🆓</span>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#22c55e" }}>{freeAgents.length}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Free Agents</div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap"
            }}>
              <input
                type="text"
                placeholder="🔍 Search teams or players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)"
                }}
              />
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                style={{
                  padding: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                  minWidth: "150px"
                }}
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Teams List */}
            <div style={{ padding: "1.5rem" }}>
              {filteredTeams.length === 0 && filteredFreeAgents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <p style={{ fontSize: "1.2rem", color: "var(--text-light)" }}>
                    {searchTerm || filterRegion !== "all"
                      ? "No teams or players found matching your filters"
                      : "No teams yet. Create a team first!"}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Team Cards */}
                  {filteredTeams.map(team => {
                    const teamPlayers = getTeamPlayers(team);
                    const isExpanded = expandedTeams[team.id];

                    return (
                      <div
                        key={team.id}
                        className="card"
                        style={{
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                          borderLeft: `4px solid ${teamPlayers.length >= 5 ? "#22c55e" :
                            teamPlayers.length > 0 ? "#f97316" : "rgba(255,255,255,0.1)"
                            }`
                        }}
                      >
                        {/* Team Header - Clickable */}
                        <div
                          onClick={() => toggleTeamExpand(team.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "1.25rem 1.5rem",
                            cursor: "pointer",
                            transition: "background 0.2s",
                            flexWrap: "wrap",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          {/* Team Logo */}
                          <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "14px",
                            background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.6rem",
                            color: "white",
                            fontWeight: "bold",
                            flexShrink: 0,
                          }}>
                            {team.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Team Info */}
                          <div style={{ flex: 1, minWidth: "150px" }}>
                            <h3 style={{
                              margin: 0,
                              fontSize: "1.15rem",
                              fontWeight: 800,
                              fontFamily: "'Exo 2', sans-serif",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}>
                              {team.name}
                              {team.managerId && (
                                <span style={{
                                  padding: "0.15rem 0.45rem", borderRadius: 5,
                                  background: "rgba(139,92,246,0.15)", color: "#8b5cf6",
                                  fontWeight: 800, fontSize: "0.6rem", letterSpacing: "0.04em",
                                }}>👑 MANAGED</span>
                              )}
                            </h3>
                            <div style={{
                              display: "flex",
                              gap: "1rem",
                              marginTop: "0.25rem",
                              fontSize: "0.82rem",
                              color: "var(--text-light)",
                              flexWrap: "wrap",
                            }}>
                              {team.org && <span>🏢 {team.org}</span>}
                              {team.region && <span>🌍 {team.region}</span>}
                              {team.coach && <span>👨‍🏫 {team.coach}</span>}
                            </div>
                          </div>

                          {/* Player Count Badge */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexShrink: 0,
                          }}>
                            <div style={{
                              padding: "0.4rem 0.85rem",
                              borderRadius: "10px",
                              background: teamPlayers.length > 0
                                ? "rgba(249,115,22,0.12)"
                                : "rgba(255,255,255,0.05)",
                              color: teamPlayers.length > 0 ? "#f97316" : "var(--text-light)",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                            }}>
                              🎮 {teamPlayers.length} player{teamPlayers.length !== 1 ? 's' : ''}
                            </div>

                            {team.rank && (
                              <div style={{
                                padding: "0.4rem 0.75rem",
                                borderRadius: "10px",
                                background: "rgba(245,158,11,0.12)",
                                color: "#f59e0b",
                                fontWeight: 800,
                                fontSize: "0.82rem",
                              }}>
                                🏆 #{team.rank}
                              </div>
                            )}

                            {/* Expand Arrow */}
                            <span style={{
                              fontSize: "1.1rem",
                              transition: "transform 0.3s ease",
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              color: "var(--text-light)",
                            }}>
                              ▼
                            </span>
                          </div>
                        </div>

                        {/* Expanded Player List */}
                        {isExpanded && (
                          <div style={{
                            borderTop: "1px solid var(--border)",
                            background: "rgba(0,0,0,0.15)",
                            animation: "fadeSlideDown 0.3s ease",
                          }}>
                            {teamPlayers.length === 0 ? (
                              <div style={{
                                textAlign: "center",
                                padding: "2rem",
                                color: "var(--text-light)",
                                fontSize: "0.9rem",
                              }}>
                                <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" }}>🫥</span>
                                No players in this team yet
                              </div>
                            ) : (
                              <div style={{ padding: "0.75rem" }}>
                                {/* Player Table Header */}
                                <div style={{
                                  display: "grid",
                                  gridTemplateColumns: "2fr 1.5fr 1fr 1fr auto",
                                  gap: "0.5rem",
                                  padding: "0.6rem 1rem",
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  color: "rgba(255,255,255,0.3)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                                }}>
                                  <span>Player</span>
                                  <span>IGN</span>
                                  <span>Role</span>
                                  <span>Country</span>
                                  <span>Actions</span>
                                </div>

                                {/* Player Rows */}
                                {teamPlayers.map((player, idx) => (
                                  <div
                                    key={player.id}
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "2fr 1.5fr 1fr 1fr auto",
                                      gap: "0.5rem",
                                      padding: "0.85rem 1rem",
                                      alignItems: "center",
                                      borderBottom: idx < teamPlayers.length - 1
                                        ? "1px solid rgba(255,255,255,0.04)"
                                        : "none",
                                      transition: "background 0.15s",
                                      borderRadius: "8px",
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                  >
                                    {/* Name */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                      <div style={{
                                        width: "34px",
                                        height: "34px",
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, var(--secondary), var(--primary))`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.85rem",
                                        color: "white",
                                        fontWeight: "bold",
                                        flexShrink: 0,
                                      }}>
                                        {player.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{player.name}</div>
                                        {player.age && (
                                          <div style={{ fontSize: "0.72rem", color: "var(--text-light)" }}>
                                            {player.age} yrs
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* IGN */}
                                    <span style={{
                                      color: "#f97316",
                                      fontWeight: 600,
                                      fontSize: "0.85rem",
                                    }}>
                                      {player.inGameName}
                                    </span>

                                    {/* Role */}
                                    <span>
                                      {player.role ? (
                                        <span style={{
                                          padding: "0.2rem 0.5rem",
                                          backgroundColor: "rgba(139,92,246,0.15)",
                                          color: "#8b5cf6",
                                          borderRadius: "6px",
                                          fontSize: "0.75rem",
                                          fontWeight: 700,
                                        }}>
                                          {player.role}
                                        </span>
                                      ) : (
                                        <span style={{ color: "var(--text-light)", fontSize: "0.8rem" }}>—</span>
                                      )}
                                    </span>

                                    {/* Country */}
                                    <span style={{
                                      fontSize: "0.82rem",
                                      color: "var(--text-light)",
                                    }}>
                                      {player.country || "—"}
                                    </span>

                                    {/* Actions */}
                                    <div style={{ display: "flex", gap: "0.4rem" }}>
                                      <button
                                        className="btn btn-sm btn-danger"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeletePlayer(player.id, player.name);
                                        }}
                                        style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem" }}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Free Agents Section */}
                  {filteredFreeAgents.length > 0 && (
                    <div
                      className="card"
                      style={{
                        overflow: "hidden",
                        borderLeft: "4px solid rgba(34,197,94,0.5)",
                      }}
                    >
                      {/* Free Agent Header */}
                      <div
                        onClick={() => toggleTeamExpand("free-agents")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1.25rem 1.5rem",
                          cursor: "pointer",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <div style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "14px",
                          background: "linear-gradient(135deg, #22c55e, #16a34a)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.6rem",
                          color: "white",
                          flexShrink: 0,
                        }}>
                          🆓
                        </div>

                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            margin: 0,
                            fontSize: "1.15rem",
                            fontWeight: 800,
                            fontFamily: "'Exo 2', sans-serif",
                            color: "#22c55e",
                          }}>
                            Free Agents
                          </h3>
                          <p style={{
                            margin: "0.2rem 0 0",
                            fontSize: "0.82rem",
                            color: "var(--text-light)",
                          }}>
                            Players not assigned to any team
                          </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{
                            padding: "0.4rem 0.85rem",
                            borderRadius: "10px",
                            background: "rgba(34,197,94,0.12)",
                            color: "#22c55e",
                            fontWeight: 800,
                            fontSize: "0.85rem",
                          }}>
                            🎮 {filteredFreeAgents.length} player{filteredFreeAgents.length !== 1 ? 's' : ''}
                          </div>

                          <span style={{
                            fontSize: "1.1rem",
                            transition: "transform 0.3s ease",
                            transform: expandedTeams["free-agents"] ? "rotate(180deg)" : "rotate(0deg)",
                            color: "var(--text-light)",
                          }}>
                            ▼
                          </span>
                        </div>
                      </div>

                      {/* Expanded Free Agents */}
                      {expandedTeams["free-agents"] && (
                        <div style={{
                          borderTop: "1px solid var(--border)",
                          background: "rgba(0,0,0,0.15)",
                          animation: "fadeSlideDown 0.3s ease",
                        }}>
                          <div style={{ padding: "0.75rem" }}>
                            {/* Player Table Header */}
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "2fr 1.5fr 1fr 1fr auto",
                              gap: "0.5rem",
                              padding: "0.6rem 1rem",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.3)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                            }}>
                              <span>Player</span>
                              <span>IGN</span>
                              <span>Role</span>
                              <span>Country</span>
                              <span>Actions</span>
                            </div>

                            {/* Player Rows */}
                            {filteredFreeAgents.map((player, idx) => (
                              <div
                                key={player.id}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "2fr 1.5fr 1fr 1fr auto",
                                  gap: "0.5rem",
                                  padding: "0.85rem 1rem",
                                  alignItems: "center",
                                  borderBottom: idx < filteredFreeAgents.length - 1
                                    ? "1px solid rgba(255,255,255,0.04)"
                                    : "none",
                                  transition: "background 0.15s",
                                  borderRadius: "8px",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                              >
                                {/* Name */}
                                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                  <div style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.85rem",
                                    color: "white",
                                    fontWeight: "bold",
                                    flexShrink: 0,
                                  }}>
                                    {player.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{player.name}</div>
                                    {player.age && (
                                      <div style={{ fontSize: "0.72rem", color: "var(--text-light)" }}>
                                        {player.age} yrs
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* IGN */}
                                <span style={{
                                  color: "#22c55e",
                                  fontWeight: 600,
                                  fontSize: "0.85rem",
                                }}>
                                  {player.inGameName}
                                </span>

                                {/* Role */}
                                <span>
                                  {player.role ? (
                                    <span style={{
                                      padding: "0.2rem 0.5rem",
                                      backgroundColor: "rgba(139,92,246,0.15)",
                                      color: "#8b5cf6",
                                      borderRadius: "6px",
                                      fontSize: "0.75rem",
                                      fontWeight: 700,
                                    }}>
                                      {player.role}
                                    </span>
                                  ) : (
                                    <span style={{ color: "var(--text-light)", fontSize: "0.8rem" }}>—</span>
                                  )}
                                </span>

                                {/* Country */}
                                <span style={{
                                  fontSize: "0.82rem",
                                  color: "var(--text-light)",
                                }}>
                                  {player.country || "—"}
                                </span>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePlayer(player.id, player.name);
                                    }}
                                    style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem" }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Player Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <div className="flex-between">
                <h2 className="card-title">Add New Player</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "var(--text-light)"
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePlayer} style={{ padding: "1.5rem" }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter player name"
                  required
                />
              </div>

              <div className="form-group">
                <label>In-Game Name (IGN) *</label>
                <input
                  type="text"
                  value={formData.inGameName}
                  onChange={(e) => setFormData({ ...formData, inGameName: e.target.value })}
                  placeholder="Enter IGN"
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Select role</option>
                  <option value="Assaulter">Assaulter</option>
                  <option value="Support">Support</option>
                  <option value="IGL">IGL (In-Game Leader)</option>
                  <option value="Sniper">Sniper</option>
                  <option value="Fragger">Fragger</option>
                </select>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Enter country"
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter age"
                  min="13"
                  max="99"
                />
              </div>

              <div className="form-group">
                <label>Assign to Team</label>
                <select
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                >
                  <option value="">Free Agent (No Team)</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Add Player
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCreateModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            max-height: 2000px;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Players;