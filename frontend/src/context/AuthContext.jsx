import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [githubToken, setGithubToken] = useState(
    localStorage.getItem("github_token")
  );

  const [username, setUsername] = useState(
    localStorage.getItem("username")
  );

  const [userRole, setUserRole] = useState(
    localStorage.getItem("user_role")
  );

  const [projectCode, setProjectCode] = useState(
    localStorage.getItem("project_code")
  );

  const [clientName, setClientName] = useState(
    localStorage.getItem("client_name")
  );

  // Developer/Admin login through GitHub OAuth / GitHub token
  const login = (
    appToken,
    githubAccessToken,
    githubUsername,
    role = "developer"
  ) => {
    const finalRole = role || "developer";

    localStorage.setItem("token", appToken);

    localStorage.setItem(
      "github_token",
      githubAccessToken
    );

    localStorage.setItem(
      "username",
      githubUsername
    );

    localStorage.setItem(
      "user_role",
      finalRole
    );

    setToken(appToken);
    setGithubToken(githubAccessToken);
    setUsername(githubUsername);
    setUserRole(finalRole);

    localStorage.removeItem("project_code");
    localStorage.removeItem("client_name");

    setProjectCode(null);
    setClientName(null);
  };

  // Client access without GitHub account
  // Client can enter project code / invite code
  const loginAsClient = (
    name,
    code
  ) => {
    const clientToken = `client_${Date.now()}`;

    localStorage.setItem(
      "token",
      clientToken
    );

    localStorage.setItem(
      "user_role",
      "client"
    );

    localStorage.setItem(
      "client_name",
      name
    );

    localStorage.setItem(
      "project_code",
      code
    );

    localStorage.setItem(
      "username",
      name
    );

    localStorage.removeItem("github_token");

    setToken(clientToken);
    setGithubToken(null);
    setUsername(name);
    setUserRole("client");
    setClientName(name);
    setProjectCode(code);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("github_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");
    localStorage.removeItem("project_code");
    localStorage.removeItem("client_name");

    setToken(null);
    setGithubToken(null);
    setUsername(null);
    setUserRole(null);
    setProjectCode(null);
    setClientName(null);
  };

  const isAuthenticated = !!token;
  const isDeveloper = userRole === "developer";
  const isAdmin = userRole === "admin";
  const isClient = userRole === "client";

  return (
    <AuthContext.Provider
      value={{
        token,
        githubToken,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);