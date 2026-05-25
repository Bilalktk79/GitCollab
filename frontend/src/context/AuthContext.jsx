import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext();

const IDENTITY_STORAGE_KEYS = [
  "token",
  "github_token",
  "username",
  "user_role",
  "project_code",
  "client_name",

  // Old / stale keys from previous versions
  "developerId",
  "developerName",
  "clientId",
  "clientName",
  "userId",
  "userRole",
  "role",
];

const clearAuthStorage = () => {
  IDENTITY_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};

const decodeJwtPayload = (jwtToken) => {
  try {
    if (!jwtToken || typeof jwtToken !== "string") return null;

    const parts = jwtToken.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => {
          return `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`;
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

const getRoleFromPayload = (payload) => {
  return (
    payload?.role ||
    payload?.user_role ||
    payload?.userRole ||
    "developer"
  );
};

const getUsernameFromPayload = (payload) => {
  return (
    payload?.username ||
    payload?.name ||
    payload?.github_username ||
    payload?.login ||
    payload?.sub ||
    null
  );
};

const getUserIdFromPayload = (payload) => {
  return (
    payload?.id ||
    payload?.user_id ||
    payload?.userId ||
    payload?.sub ||
    null
  );
};

export const AuthProvider = ({ children }) => {
  const savedToken = localStorage.getItem("token");
  const savedPayload = decodeJwtPayload(savedToken);

  const [token, setToken] = useState(savedToken);
  const [githubToken, setGithubToken] = useState(
    localStorage.getItem("github_token")
  );

  const [currentUser, setCurrentUser] = useState(() => {
    if (!savedPayload) return null;

    return {
      id: getUserIdFromPayload(savedPayload),
      username: getUsernameFromPayload(savedPayload),
      role: getRoleFromPayload(savedPayload),
      raw: savedPayload,
    };
  });

  const [projectCode, setProjectCode] = useState(
    localStorage.getItem("project_code")
  );

  const [clientName, setClientName] = useState(
    localStorage.getItem("client_name")
  );

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }

    const payload = decodeJwtPayload(token);

    if (!payload) {
      setCurrentUser(null);
      return;
    }

    setCurrentUser({
      id: getUserIdFromPayload(payload),
      username: getUsernameFromPayload(payload),
      role: getRoleFromPayload(payload),
      raw: payload,
    });
  }, [token]);

  // Developer/Admin login through GitHub OAuth / GitHub token
  const login = (
    appToken,
    githubAccessToken,
    githubUsername,
    role = "developer"
  ) => {
    clearAuthStorage();

    const payload = decodeJwtPayload(appToken);
    const finalUsername =
      getUsernameFromPayload(payload) || githubUsername || null;
    const finalRole = getRoleFromPayload(payload) || role || "developer";

    localStorage.setItem("token", appToken);

    if (githubAccessToken) {
      localStorage.setItem("github_token", githubAccessToken);
    }

    // Keep only compatibility keys for old UI parts.
    // Source of truth is still JWT/currentUser.
    if (finalUsername) {
      localStorage.setItem("username", finalUsername);
    }

    localStorage.setItem("user_role", finalRole);

    setToken(appToken);
    setGithubToken(githubAccessToken || null);

    setCurrentUser({
      id: getUserIdFromPayload(payload),
      username: finalUsername,
      role: finalRole,
      raw: payload,
    });

    setProjectCode(null);
    setClientName(null);
  };

  // Client access without GitHub account
  const loginAsClient = (name, code) => {
    clearAuthStorage();

    const clientToken = `client_${Date.now()}`;

    localStorage.setItem("token", clientToken);
    localStorage.setItem("user_role", "client");
    localStorage.setItem("client_name", name);
    localStorage.setItem("project_code", code);
    localStorage.setItem("username", name);

    setToken(clientToken);
    setGithubToken(null);

    setCurrentUser({
      id: code,
      username: name,
      role: "client",
      raw: null,
    });

    setClientName(name);
    setProjectCode(code);
  };

  const logout = () => {
    clearAuthStorage();

    setToken(null);
    setGithubToken(null);
    setCurrentUser(null);
    setProjectCode(null);
    setClientName(null);
  };

  const username = currentUser?.username || null;
  const userRole = currentUser?.role || null;
  const userId = currentUser?.id || null;

  const isAuthenticated = !!token;
  const isDeveloper = userRole === "developer";
  const isAdmin = userRole === "admin";
  const isClient = userRole === "client";

  const value = useMemo(
    () => ({
      token,
      githubToken,

      currentUser,
      userId,
      username,
      userRole,

      projectCode,
      clientName,

      login,
      loginAsClient,
      logout,

      isAuthenticated,
      isDeveloper,
      isAdmin,
      isClient,
    }),
    [
      token,
      githubToken,
      currentUser,
      userId,
      username,
      userRole,
      projectCode,
      clientName,
      isAuthenticated,
      isDeveloper,
      isAdmin,
      isClient,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);