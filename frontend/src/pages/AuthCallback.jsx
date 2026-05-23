import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "../styles/pages.css";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [message, setMessage] = useState("Completing GitHub login...");

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const token = params.get("token");
    const githubToken = params.get("github_token");
    const username = params.get("username");
    const role = params.get("role") || "developer";
    const error = params.get("error");

    if (error) {
      setMessage(decodeURIComponent(error));

      setTimeout(() => {
        navigate("/login");
      }, 1800);

      return;
    }

    if (!token || !githubToken || !username) {
      setMessage("GitHub login failed. Missing login data.");

      setTimeout(() => {
        navigate("/login");
      }, 1800);

      return;
    }

    login(token, githubToken, username, role);

    setMessage("GitHub login successful. Redirecting...");

    setTimeout(() => {
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }, 1000);
  }, [location.search, login, navigate]);

  return (
    <div className="page">
      <h1 className="page-title">
        GitHub <span className="orange">Authentication</span>
      </h1>

      <div className="underline"></div>

      <div className="auth-card">
        <p style={{ textAlign: "center", color: "#c9d1d9" }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;