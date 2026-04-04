import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("be_user");
      const token = sessionStorage.getItem("be_token");
      if (stored && token) {
        setUser(JSON.parse(stored));
      }
    } catch (_err) {
      sessionStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * login({ username, email, roles, token })
   * roles is an array like ["ROLE_PLAYER"] or ["ROLE_ORGANIZER"]
   */
  const login = (userData) => {
    const { token, ...rest } = userData;
    if (token) sessionStorage.setItem("be_token", token);
    sessionStorage.setItem("be_user", JSON.stringify(rest));
    setUser(rest);
  };

  const logout = () => {
    sessionStorage.removeItem("be_user");
    sessionStorage.removeItem("be_token");
    setUser(null);
  };

  const isOrganizer = () => {
    if (!user?.roles) return false;
    return (
      user.roles.includes("ROLE_ORGANIZER") ||
      user.roles.includes("ROLE_ADMIN") ||
      user.role === "organizer"
    );
  };

  const isManager = () => {
    if (!user?.roles) return false;
    return user.roles.includes("ROLE_MANAGER") || user.role === "manager";
  };

  const isPlayer = () => {
    if (!user?.roles) return false;
    return user.roles.includes("ROLE_PLAYER") || user.roles.includes("ROLE_USER");
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isOrganizer,
    isManager,
    isPlayer,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
