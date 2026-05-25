import { useEffect, useState } from "react";
import { FaGithub, FaUserTie } from "react-icons/fa";
import { useNavigate, Link, useLocation } from "react-router-dom";

import "../styles/pages.css";

import { githubTokenLogin } from "../services/auth";
import { useAuth } from "../context/AuthContext";

const STALE_AUTH_KEYS = [
  "developerId",
  "developerName",
  "clientId",
  "clientName",
  "userId",
  "userRole",
  "role",
  "client_name",
  "project_code",
];

const clearStaleIdentityKeys = () => {
  STALE_AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};

const Login = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const { login, logout } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      setErrorMessage(decodeURIComponent(error));
    }
  }, [location.search]);

  // OAuth GitHub Login
  const loginWithGithub = () => {
    setErrorMessage("");

    // Clear old client/developer identity before new GitHub OAuth login
    clearStaleIdentityKeys();

    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

    window.location.href = `${API_BASE_URL}/api/auth/github/login`;
  };

  // Token Login
  const loginWithToken = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      setErrorMessage("Please enter GitHub token.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      // Clear previous stale session before new token login
      logout();
      clearStaleIdentityKeys();

      const data = await githubTokenLogin(token.trim());

      login(
        data.token,
        data.github_token,
        data.username,
        data.role || "developer"
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("GitHub token login error:", error);

      const backendMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Login failed. Please try again.";

      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Developer Access</h1>

      <div className="underline"></div>

      <div className="auth-card">
        {errorMessage && (
          <div className="admin-error-message">{errorMessage}</div>
        )}

        {/* GitHub OAuth Login */}
        <button
          className="primary-btn"
          onClick={loginWithGithub}
          disabled={loading}
        >
          <FaGithub />
          Login with GitHub
        </button>

        <p
          style={{
            textAlign: "center",
            margin: "25px 0",
          }}
        >
          OR
        </p>

        {/* Token Login */}
        <form onSubmit={loginWithToken}>
          <input
            type="password"
            placeholder="Enter GitHub Personal Access Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={loading}
          />

          <button
            className="primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login with Token"}
          </button>
        </form>

        {/* Client Access */}
        <div className="client-access-box">
          <p>Are you a non-technical client?</p>

          <Link
            to="/client-access"
            className="secondary-btn client-access-btn"
          >
            <FaUserTie />
            Access Project as Client
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;