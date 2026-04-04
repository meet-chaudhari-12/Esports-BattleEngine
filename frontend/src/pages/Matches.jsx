import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";

function Matches() {
  const navigate = useNavigate();
  const { isOrganizer } = useAuth();
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTournament, setFilterTournament] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesRes, tournamentsRes, teamsRes] = await Promise.all([
        api.get("/matches").catch(() => ({ data: [] })),
        api.get("/tournaments").catch(() => ({ data: [] })),
        api.get("/teams").catch(() => ({ data: [] }))
      ]);

      setMatches(matchesRes.data || []);
      setTournaments(tournamentsRes.data || []);
      setTeams(teamsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : "TBD";
  };

  const getTournamentName = (tournamentId) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    return tournament ? tournament.name : "Unknown Tournament";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED": return "var(--primary)";
      case "ONGOING": return "var(--warning)";
      case "COMPLETED": return "var(--success)";
      default: return "var(--text-light)";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "SCHEDULED": return "📅";
      case "ONGOING": return "🔴";
      case "COMPLETED": return "✅";
      default: return "⚪";
    }
  };

  const filteredMatches = matches.filter(match => {
    const matchesTournament = filterTournament === "all" || match.tournamentId === filterTournament;
    const matchesStatus = filterStatus === "all" || match.status === filterStatus;
    return matchesTournament && matchesStatus;
  });

  // Group matches by tournament
  const matchesByTournament = filteredMatches.reduce((acc, match) => {
    const tournamentId = match.tournamentId || "unknown";
    if (!acc[tournamentId]) {
      acc[tournamentId] = [];
    }
    acc[tournamentId].push(match);
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
        <Navbar />
        <div style={{ paddingTop: "70px", position: "relative", zIndex: 1 }}>
          <div className="container" style={{ padding: "2rem 24px" }}>
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading matches...</p>
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
                <h1 className="card-title" style={{ margin: 0, fontSize: "1.6rem" }}>Matches</h1>
                {isOrganizer() && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/schedule-match")}
                  >
                    + Schedule Match
                  </button>
                )}
              </div>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                View and manage tournament matches
              </p>
            </div>

            {/* Quick Stats */}
            <div style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap"
            }}>
              <div>
                <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Total</span>
                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>
                  {matches.length}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Scheduled</span>
                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary)" }}>
                  {matches.filter(m => m.status === "SCHEDULED").length}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Ongoing</span>
                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "var(--warning)" }}>
                  {matches.filter(m => m.status === "ONGOING").length}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>Completed</span>
                <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "var(--success)" }}>
                  {matches.filter(m => m.status === "COMPLETED").length}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap"
            }}>
              <select
                value={filterTournament}
                onChange={(e) => setFilterTournament(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "0.75rem",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)"
                }}
              >
                <option value="all">All Tournaments</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["all", "SCHEDULED", "ONGOING", "COMPLETED"].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    style={{
                      padding: "0.75rem 1rem",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      backgroundColor: filterStatus === status ? "var(--primary)" : "var(--bg)",
                      color: filterStatus === status ? "white" : "var(--text)",
                      cursor: "pointer",
                      fontWeight: filterStatus === status ? "600" : "400",
                      transition: "all 0.2s"
                    }}
                  >
                    {status === "all" ? "All" : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Matches List */}
            <div style={{ padding: "1.5rem" }}>
              {filteredMatches.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <p style={{ fontSize: "1.2rem", color: "var(--text-light)" }}>
                    No matches found. Schedule your first match!
                  </p>
                </div>
              ) : (
                Object.entries(matchesByTournament).map(([tournamentId, tournamentMatches]) => (
                  <div key={tournamentId} style={{ marginBottom: "2rem" }}>
                    <h3 style={{
                      marginBottom: "1rem",
                      paddingBottom: "0.5rem",
                      borderBottom: "2px solid var(--border)"
                    }}>
                      🏆 {getTournamentName(tournamentId)}
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {tournamentMatches.map(match => (
                        <div
                          key={match.id}
                          className="card"
                          style={{
                            borderLeft: `4px solid ${getStatusColor(match.status)}`,
                            cursor: "pointer",
                            transition: "transform 0.2s"
                          }}
                          onClick={() => {
                            if (match.status !== "COMPLETED" && isOrganizer()) {
                              navigate(`/matches/${match.id}/submit`);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateX(4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "1rem"
                          }}>
                            {/* Match Info */}
                            <div style={{ flex: 1, minWidth: "250px" }}>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                marginBottom: "0.5rem"
                              }}>
                                <span style={{
                                  padding: "0.25rem 0.75rem",
                                  borderRadius: "12px",
                                  backgroundColor: getStatusColor(match.status),
                                  color: "white",
                                  fontSize: "0.75rem",
                                  fontWeight: "600"
                                }}>
                                  {getStatusIcon(match.status)} {match.status}
                                </span>
                                {match.round && (
                                  <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>
                                    Round {match.round}
                                  </span>
                                )}
                              </div>

                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                fontSize: "1.1rem",
                                fontWeight: "600"
                              }}>
                                <span>{getTeamName(match.teamIds?.[0])}</span>
                                <span style={{ color: "var(--text-light)" }}>VS</span>
                                <span>{getTeamName(match.teamIds?.[1])}</span>
                              </div>

                              {match.scheduledAt && (
                                <p style={{
                                  margin: "0.5rem 0 0 0",
                                  color: "var(--text-light)",
                                  fontSize: "0.85rem"
                                }}>
                                  🕐 {new Date(match.scheduledAt).toLocaleString()}
                                </p>
                              )}
                            </div>

                            {/* Match Score/Actions */}
                            <div style={{ textAlign: "right" }}>
                              {match.status === "COMPLETED" && match.finalScore ? (
                                <div>
                                  <div style={{
                                    fontSize: "1.5rem",
                                    fontWeight: "bold",
                                    color: "var(--success)",
                                    marginBottom: "0.5rem"
                                  }}>
                                    {Object.entries(match.finalScore).map(([teamId, score], index) => (
                                      <span key={teamId}>
                                        {score}
                                        {index === 0 && " - "}
                                      </span>
                                    ))}
                                  </div>
                                  {match.winnerTeamId && (
                                    <p style={{
                                      margin: 0,
                                      color: "var(--success)",
                                      fontSize: "0.85rem"
                                    }}>
                                      🏆 {getTeamName(match.winnerTeamId)} won
                                    </p>
                                  )}
                                </div>
                              ) : isOrganizer() && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/matches/${match.id}/submit`);
                                  }}
                                >
                                  Submit Result →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Matches;