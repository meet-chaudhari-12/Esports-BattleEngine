import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";

function Teams() {
  const navigate = useNavigate();
  const { user, isOrganizer, isManager: isUserManager } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(null); // teamId or null
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [myRequests, setMyRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    org: "",
    region: "",
    coach: ""
  });

  const userId = user?.id || "";
  const org = isOrganizer();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [teamsRes, myReqRes] = await Promise.all([
        api.get("/teams"),
        api.get("/join-requests/my").catch(() => ({ data: [] })),
      ]);
      setTeams(teamsRes.data || []);
      setMyRequests(myReqRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingForTeam = async (teamId) => {
    try {
      const res = await api.get(`/join-requests/team/${teamId}`);
      setPendingRequests(prev => ({ ...prev, [teamId]: res.data || [] }));
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Create Team ───────────────────────────────────────────
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Team name is required", "error");
      return;
    }

    try {
      await api.post("/teams", formData);
      showToast("✅ Team created! You are the team manager.");
      setShowCreateModal(false);
      setFormData({ name: "", org: "", region: "", coach: "" });
      fetchAll();
    } catch (error) {
      console.error("Error creating team:", error);
      showToast(error.response?.data?.message || "Failed to create team", "error");
    }
  };

  // ─── Request to Join ───────────────────────────────────────
  const handleRequestJoin = async (teamId) => {
    setActionLoading(true);
    try {
      await api.post("/join-requests", { teamId });
      showToast("📩 Join request sent! Waiting for manager approval.");
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Accept / Reject ──────────────────────────────────────
  const handleAcceptRequest = async (requestId, teamId) => {
    setActionLoading(true);
    try {
      await api.post(`/join-requests/${requestId}/accept`);
      showToast("✅ Player accepted into the team!");
      fetchPendingForTeam(teamId);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to accept", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId, teamId) => {
    setActionLoading(true);
    try {
      await api.post(`/join-requests/${requestId}/reject`);
      showToast("❌ Request rejected.");
      fetchPendingForTeam(teamId);
      fetchAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reject", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Delete Team ───────────────────────────────────────────
  const handleDeleteTeam = async (teamId, teamName) => {
    if (!confirm(`Are you sure you want to delete "${teamName}"?`)) return;
    try {
      await api.delete(`/teams/${teamId}`);
      showToast("Team deleted.");
      fetchAll();
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete team", "error");
    }
  };

  // ─── Helpers ───────────────────────────────────────────────
  const isMyTeam = (team) => {
    return team.managerId === userId ||
      (team.playerIds && team.playerIds.includes(userId));
  };

  const isManager = (team) => team.managerId === userId;

  const getMyRequestStatus = (teamId) => {
    const req = myRequests.find(r => r.teamId === teamId);
    return req ? req.status : null;
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.org && team.org.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRegion = filterRegion === "all" || team.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  const regions = [...new Set(teams.map(t => t.region).filter(Boolean))];
  const myTeams = teams.filter(t => isMyTeam(t));

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
        <Navbar />
        <div style={{ paddingTop: "70px", position: "relative", zIndex: 1 }}>
          <div className="container" style={{ padding: "2rem 24px" }}>
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading teams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <div style={{ paddingTop: "70px", position: "relative", zIndex: 1 }}>
        <div className="container" style={{ padding: "2rem 24px" }}>
          <div className="card">
            <div className="card-header" style={{ display: "block", borderBottom: "none", paddingBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                <h1 className="card-title" style={{ margin: 0, fontSize: "1.6rem" }}>Teams</h1>
                {isUserManager() && (
                  <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    + Create Team
                  </button>
                )}
              </div>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                Browse teams, request to join, or create your own
              </p>
            </div>

            {/* My Teams Banner */}
            {myTeams.length > 0 && (
              <div style={{
                padding: "0.85rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                background: "rgba(249,115,22,0.04)",
                display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center",
              }}>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f97316" }}>🏠 My Teams:</span>
                {myTeams.map(t => (
                  <span key={t.id} style={{
                    padding: "0.3rem 0.7rem", borderRadius: 8,
                    background: isManager(t) ? "rgba(139,92,246,0.15)" : "rgba(249,115,22,0.12)",
                    color: isManager(t) ? "#8b5cf6" : "#f97316",
                    fontWeight: 700, fontSize: "0.8rem",
                    display: "inline-flex", alignItems: "center", gap: "0.3rem",
                  }}>
                    {isManager(t) && "👑 "}{t.name}
                  </span>
                ))}
              </div>
            )}

            {/* Search and Filter */}
            <div style={{
              padding: "1rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              display: "flex", gap: "1rem", flexWrap: "wrap"
            }}>
              <input
                type="text"
                placeholder="🔍 Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1, minWidth: "200px", padding: "0.75rem",
                  border: "1px solid var(--border)", borderRadius: "8px",
                  backgroundColor: "var(--bg)", color: "var(--text)"
                }}
              />
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                style={{
                  padding: "0.75rem", border: "1px solid var(--border)",
                  borderRadius: "8px", backgroundColor: "var(--bg)",
                  color: "var(--text)", minWidth: "150px"
                }}
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Teams Grid */}
            <div style={{ padding: "1.5rem" }}>
              {filteredTeams.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <p style={{ fontSize: "1.2rem", color: "var(--text-light)" }}>
                    {searchTerm || filterRegion !== "all"
                      ? "No teams found matching your filters"
                      : "No teams yet. Create your first team!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-3">
                  {filteredTeams.map(team => {
                    const iAmMember = isMyTeam(team);
                    const iAmManager = isManager(team);
                    const requestStatus = getMyRequestStatus(team.id);

                    return (
                      <div
                        key={team.id}
                        className="card"
                        style={{
                          transition: "transform 0.2s, box-shadow 0.2s",
                          position: "relative",
                          borderLeft: iAmManager ? "4px solid #8b5cf6" :
                            iAmMember ? "4px solid #f97316" :
                              "4px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* Manager Badge */}
                        {iAmManager && (
                          <div style={{
                            position: "absolute", top: "0.75rem", right: "0.75rem",
                            padding: "0.2rem 0.5rem", borderRadius: 6,
                            background: "rgba(139,92,246,0.15)", color: "#8b5cf6",
                            fontWeight: 800, fontSize: "0.65rem", letterSpacing: "0.05em",
                          }}>
                            👑 MANAGER
                          </div>
                        )}

                        {iAmMember && !iAmManager && (
                          <div style={{
                            position: "absolute", top: "0.75rem", right: "0.75rem",
                            padding: "0.2rem 0.5rem", borderRadius: 6,
                            background: "rgba(249,115,22,0.12)", color: "#f97316",
                            fontWeight: 800, fontSize: "0.65rem", letterSpacing: "0.05em",
                          }}>
                            ✅ MEMBER
                          </div>
                        )}

                        {/* Team Logo/Initial */}
                        <div style={{
                          width: "80px", height: "80px", borderRadius: "12px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "2rem", color: "white", fontWeight: "bold",
                          marginBottom: "1rem",
                          background: iAmManager
                            ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                            : "linear-gradient(135deg, var(--primary), var(--secondary))",
                        }}>
                          {team.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Team Info */}
                        <h3 style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}>
                          {team.name}
                        </h3>

                        {team.org && (
                          <p style={{ color: "var(--text-light)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                            🏢 {team.org}
                          </p>
                        )}

                        <div style={{
                          display: "flex", gap: "0.75rem", marginTop: "0.75rem",
                          fontSize: "0.85rem", color: "var(--text-light)", flexWrap: "wrap",
                        }}>
                          {team.region && <span>🌍 {team.region}</span>}
                          {team.rank && (
                            <span style={{ color: "var(--warning)", fontWeight: "600" }}>
                              🏆 #{team.rank}
                            </span>
                          )}
                        </div>

                        {team.playerIds && team.playerIds.length > 0 && (
                          <div style={{
                            marginTop: "0.75rem", padding: "0.5rem",
                            backgroundColor: "var(--surface)", borderRadius: "6px",
                            fontSize: "0.85rem"
                          }}>
                            👥 {team.playerIds.length} player{team.playerIds.length !== 1 ? 's' : ''}
                          </div>
                        )}

                        {team.coach && (
                          <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-light)" }}>
                            👨‍🏫 Coach: {team.coach}
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {/* Manager Actions */}
                          {iAmManager && (
                            <button
                              className="btn btn-sm"
                              style={{
                                flex: 1, background: "rgba(139,92,246,0.15)",
                                color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.3)",
                                fontWeight: 700, position: "relative",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchPendingForTeam(team.id);
                                setShowRequestsModal(team.id);
                              }}
                            >
                              📋 Manage Requests
                            </button>
                          )}

                          {/* Join Request Button for non-members */}
                          {!iAmMember && !requestStatus && (
                            <button
                              className="btn btn-sm btn-primary"
                              disabled={actionLoading}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestJoin(team.id);
                              }}
                              style={{ flex: 1 }}
                            >
                              📩 Request to Join
                            </button>
                          )}

                          {/* Pending Status */}
                          {!iAmMember && requestStatus === "PENDING" && (
                            <div style={{
                              flex: 1, textAlign: "center", padding: "0.5rem",
                              borderRadius: 8, background: "rgba(249,115,22,0.08)",
                              color: "#f97316", fontWeight: 700, fontSize: "0.82rem",
                              border: "1px solid rgba(249,115,22,0.2)",
                            }}>
                              ⏳ Request Pending
                            </div>
                          )}

                          {/* Rejected Status */}
                          {!iAmMember && requestStatus === "REJECTED" && (
                            <div style={{
                              flex: 1, textAlign: "center", padding: "0.5rem",
                              borderRadius: 8, background: "rgba(239,68,68,0.08)",
                              color: "#ef4444", fontWeight: 700, fontSize: "0.82rem",
                              border: "1px solid rgba(239,68,68,0.2)",
                            }}>
                              ❌ Request Denied
                            </div>
                          )}

                          {/* Delete (organizers or managers) */}
                          {(org || iAmManager) && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTeam(team.id, team.name);
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Create Team Modal ──────────────────────────────────── */}
      {showCreateModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setShowCreateModal(false)}>
          <div className="card" style={{
            maxWidth: "500px", width: "90%", maxHeight: "90vh", overflow: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <div className="flex-between">
                <h2 className="card-title">Create New Team</h2>
                <button onClick={() => setShowCreateModal(false)}
                  style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-light)" }}>
                  ×
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div style={{
              margin: "1rem 1.5rem 0", padding: "0.75rem 1rem",
              background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: 10, display: "flex", gap: "0.6rem", alignItems: "center",
            }}>
              <span style={{ fontSize: "1.2rem" }}>👑</span>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
                You will become the <strong style={{ color: "#8b5cf6" }}>Team Manager</strong> and can accept or reject join requests from other players.
              </p>
            </div>

            <form onSubmit={handleCreateTeam} style={{ padding: "1.5rem" }}>
              <div className="form-group">
                <label>Team Name *</label>
                <input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter team name" required />
              </div>
              <div className="form-group">
                <label>Organization</label>
                <input type="text" value={formData.org}
                  onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                  placeholder="Enter organization name" />
              </div>
              <div className="form-group">
                <label>Region</label>
                <select value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}>
                  <option value="">Select region</option>
                  <option value="Asia">Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Oceania">Oceania</option>
                  <option value="Africa">Africa</option>
                </select>
              </div>
              <div className="form-group">
                <label>Coach</label>
                <input type="text" value={formData.coach}
                  onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                  placeholder="Enter coach name" />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Team & Become Manager
                </button>
                <button type="button" className="btn btn-outline"
                  onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Manage Requests Modal ──────────────────────────────── */}
      {showRequestsModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setShowRequestsModal(null)}>
          <div className="card" style={{
            maxWidth: "550px", width: "90%", maxHeight: "90vh", overflow: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <div className="flex-between">
                <h2 className="card-title">
                  📋 Join Requests — {teams.find(t => t.id === showRequestsModal)?.name}
                </h2>
                <button onClick={() => setShowRequestsModal(null)}
                  style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-light)" }}>
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: "1.5rem" }}>
              {(!pendingRequests[showRequestsModal] || pendingRequests[showRequestsModal].length === 0) ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-light)" }}>
                  <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.75rem" }}>📭</span>
                  <p style={{ fontWeight: 600, fontSize: "1rem" }}>No pending requests</p>
                  <p style={{ fontSize: "0.85rem" }}>When players request to join your team, they'll appear here.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {pendingRequests[showRequestsModal].map(req => (
                    <div key={req.id} style={{
                      display: "flex", alignItems: "center", gap: "1rem",
                      padding: "1rem 1.25rem",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 12, flexWrap: "wrap",
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: 42, height: 42, borderRadius: "50%",
                        background: "linear-gradient(135deg, #f97316, #8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.1rem", color: "white", fontWeight: "bold",
                        flexShrink: 0,
                      }}>
                        {(req.username || "?").charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                          {req.username || "Unknown User"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                          Requested {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "recently"}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-sm"
                          disabled={actionLoading}
                          onClick={() => handleAcceptRequest(req.id, showRequestsModal)}
                          style={{
                            background: "rgba(34,197,94,0.15)", color: "#22c55e",
                            border: "1px solid rgba(34,197,94,0.3)", fontWeight: 700,
                          }}
                        >
                          ✅ Accept
                        </button>
                        <button
                          className="btn btn-sm"
                          disabled={actionLoading}
                          onClick={() => handleRejectRequest(req.id, showRequestsModal)}
                          style={{
                            background: "rgba(239,68,68,0.15)", color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.3)", fontWeight: 700,
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

export default Teams;