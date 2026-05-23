import { useEffect, useState } from "react";
import { FaGithub, FaUserTie } from "react-icons/fa";
import { useNavigate, Link, useLocation } from "react-router-dom";

import "../styles/pages.css";

import { githubTokenLogin } from "../services/auth";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

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

      const data = await githubTokenLogin(token);

      login(
        data.token,
        data.github_token,
        data.username,
        data.role || "developer"
      );

      alert("GitHub Login Successful");

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
          <div className="admin-error-message">
            {errorMessage}
          </div>
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