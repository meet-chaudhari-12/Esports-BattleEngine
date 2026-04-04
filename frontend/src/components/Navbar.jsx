import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Navbar() {
  const { user, isAuthenticated, isOrganizer, isManager, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const organizerLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "⊞" },
    { path: "/tournaments", label: "Tournaments", icon: "🏆" },
    { path: "/teams", label: "Teams", icon: "👥" },
    { path: "/players", label: "Squads", icon: "🎮" },
    { path: "/matches", label: "Matches", icon: "⚔️" },
    { path: "/news", label: "News", icon: "📰" },
  ];

  const playerLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "⊞" },
    { path: "/tournaments", label: "Browse", icon: "🏆" },
    { path: "/teams", label: "Teams", icon: "👥" },
    { path: "/players", label: "Squads", icon: "🎮" },
    { path: "/matches", label: "Matches", icon: "⚔️" },
    { path: "/news", label: "News", icon: "📰" },
  ];

  const managerLinks = [
    { path: "/dashboard", label: "Dashboard", icon: "⊞" },
    { path: "/tournaments", label: "Browse", icon: "🏆" },
    { path: "/teams", label: "Teams", icon: "👥" },
    { path: "/players", label: "Squads", icon: "🎮" },
    { path: "/matches", label: "Matches", icon: "⚔️" },
    { path: "/news", label: "News", icon: "📰" },
  ];

  const navLinks = isAuthenticated
    ? isOrganizer()
      ? organizerLinks
      : isManager()
        ? managerLinks
        : playerLinks
    : [{ path: "/tournaments", label: "Tournaments", icon: "🏆" }];

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  const roleLabel = isOrganizer() ? "Organizer" : isManager() ? "Manager" : "Player";
  const roleClass = isOrganizer() ? "organizer" : isManager() ? "manager" : "player";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-brand">
          <div className="navbar-logo-icon">⚡</div>
          <span className="navbar-brand-text">BattleEngine</span>
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link${isActive(link.path) ? " active" : ""}`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Show create btn for organizers */}
              {isOrganizer() && (
                <Link to="/create-tournament" className="btn btn-primary btn-sm">
                  + Create
                </Link>
              )}

              {/* User chip */}
              <div className="nav-user-chip">
                <div className="nav-avatar">{initials}</div>
                <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.username}
                </span>
                <span className={`nav-role-badge ${roleClass}`}>{roleLabel}</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                title="Logout"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;