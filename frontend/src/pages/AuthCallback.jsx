import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import "../styles/pages.css";

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
    console.error("Failed to decode JWT in callback:", error);
    return null;
  }
};

const getRoleFromPayload = (payload, fallbackRole = "developer") => {
  return (
    payload?.role ||
    payload?.user_role ||
    payload?.userRole ||
    fallbackRole ||
    "developer"
  );
};

const getUsernameFromPayload = (payload, fallbackUsername = null) => {
  return (
    payload?.username ||
    payload?.name ||
    payload?.github_username ||
    payload?.login ||
    fallbackUsername ||
    null
  );
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const hasProcessed = useRef(false);

  const [message, setMessage] = useState("Completing GitHub login...");

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const params = new URLSearchParams(location.search);

    const token = params.get("token");
    const githubToken = params.get("github_token");
    const urlUsername = params.get("username");
    const urlRole = params.get("role") || "developer";
    const error = params.get("error");

    const redirectToLogin = (msg) => {
      setMessage(msg);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    };

    if (error) {
      redirectToLogin(decodeURIComponent(error));
      return;
    }

    if (!token || !githubToken) {
      redirectToLogin("GitHub login failed. Missing login data.");
      return;
    }

    clearStaleIdentityKeys();

    const payload = decodeJwtPayload(token);

    const finalUsername = getUsernameFromPayload(payload, urlUsername);
    const finalRole = getRoleFromPayload(payload, urlRole);

    if (!finalUsername) {
      redirectToLogin("GitHub login failed. Username not found.");
      return;
    }

    login(token, githubToken, finalUsername, finalRole);

    setMessage("GitHub login successful. Redirecting...");

    setTimeout(() => {
      navigate(finalRole === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    }, 700);
  }, [location.search, navigate]);

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