import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaUserTie,
  FaKey,
  FaArrowRight,
  FaComments,
  FaCodeBranch,
  FaShieldAlt,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import "../styles/clientAccess.css";
import { verifyClientAccess } from "../services/clientService";

const ClientAccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginAsClient } = useAuth();

  const inviteCode = searchParams.get("code") || "";

  const [formData, setFormData] = useState({
    clientName: "",
    projectCode: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      setFormData((prev) => ({
        ...prev,
        projectCode: inviteCode.trim().toUpperCase(),
      }));
    }
  }, [inviteCode]);

  const handleChange = (e) => {
    setError("");

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const clearOldClientStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("github_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");
    localStorage.removeItem("project_code");
    localStorage.removeItem("client_name");

    localStorage.removeItem("userId");
    localStorage.removeItem("clientId");
    localStorage.removeItem("clientName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("role");
    localStorage.removeItem("projectCode");
    localStorage.removeItem("clientProjectName");
    localStorage.removeItem("client_project_name");
    localStorage.removeItem("clientDeveloperId");
    localStorage.removeItem("client_developer_id");
    localStorage.removeItem("clientDeveloperName");
    localStorage.removeItem("client_developer_name");
  };

  const handleClientAccess = async (e) => {
    e.preventDefault();

    const name = formData.clientName.trim();
    const code = formData.projectCode.trim().toUpperCase();

    if (!name || !code) {
      setError("Please enter your name and project access code.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await verifyClientAccess({
        client_name: name,
        project_code: code,
      });

      if (!data?.success) {
        setError(data?.message || "Invalid project access code.");
        return;
      }

      const clientName = data.client_name || name;
      const projectCode = data.project_code || code;
      const clientId =
        data.client_id || `client_${projectCode.replaceAll("-", "_")}`;
      const developerId = data.developer_id || "";
      const developerName = data.developer_name || "";

      clearOldClientStorage();

      loginAsClient(clientName, projectCode);

      localStorage.setItem("token", data.token || "");
      localStorage.setItem("userId", clientId);
      localStorage.setItem("clientId", clientId);
      localStorage.setItem("username", clientName);
      localStorage.setItem("client_name", clientName);
      localStorage.setItem("clientName", clientName);
      localStorage.setItem("user_role", "client");
      localStorage.setItem("userRole", "client");
      localStorage.setItem("role", "client");
      localStorage.setItem("project_code", projectCode);
      localStorage.setItem("projectCode", projectCode);
      localStorage.setItem("clientProjectName", data.repo_name || "");
      localStorage.setItem("client_project_name", data.repo_name || "");
      localStorage.setItem("clientDeveloperId", developerId);
      localStorage.setItem("client_developer_id", developerId);
      localStorage.setItem("clientDeveloperName", developerName);
      localStorage.setItem("client_developer_name", developerName);

      navigate("/commits");
    } catch (error) {
      console.error("Client access error:", error);

      const backendMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Invalid project access code. Please contact your developer.";

      if (
        backendMessage.toLowerCase().includes("revoked") ||
        backendMessage.toLowerCase().includes("inactive")
      ) {
        setError(
          "This client access has been revoked by admin. Please contact your developer."
        );
      } else {
        setError(backendMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-access-page">
      <div className="client-access-card">
        <div className="client-access-left">
          <div className="client-icon">
            <FaUserTie />
          </div>

          <h1>
            Client <span>Access</span>
          </h1>

          <p>
            Clients do not need a GitHub account. Enter your project access code
            to review commits and chat directly with the developer.
          </p>

          <div className="client-feature-list">
            <div className="client-feature">
              <FaCodeBranch />
              <div>
                <h3>Review Commits</h3>
                <p>
                  View developer changes in simple client-friendly language.
                </p>
              </div>
            </div>

            <div className="client-feature">
              <FaComments />
              <div>
                <h3>Chat with Developer</h3>
                <p>Discuss required changes directly with the developer.</p>
              </div>
            </div>

            <div className="client-feature">
              <FaShieldAlt />
              <div>
                <h3>No GitHub Required</h3>
                <p>Access your project using only a secure project code.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="client-access-right">
          <form className="client-form" onSubmit={handleClientAccess}>
            <h2>Enter Project</h2>

            {inviteCode && (
              <p className="client-note">
                Invite code detected. Enter your name and continue.
              </p>
            )}

            <div className="client-form-group">
              <label>Client Name</label>

              <div className="client-input-box">
                <FaUserTie />
                <input
                  type="text"
                  name="clientName"
                  placeholder="Enter your name"
                  value={formData.clientName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="client-form-group">
              <label>Project Access Code</label>

              <div className="client-input-box">
                <FaKey />
                <input
                  type="text"
                  name="projectCode"
                  placeholder="Example: ABC123"
                  value={formData.projectCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && <p className="client-error">{error}</p>}

            <button
              type="submit"
              className="client-access-btn"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Continue to Project"}
              <FaArrowRight />
            </button>

            <p className="client-note">
              Use the project access code or invite link provided by your
              developer.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientAccess;