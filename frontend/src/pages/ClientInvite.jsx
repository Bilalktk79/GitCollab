import { useState } from "react";
import {
  FaUserTie,
  FaGithub,
  FaCodeBranch,
  FaKey,
  FaCopy,
  FaPlus,
  FaExternalLinkAlt,
} from "react-icons/fa";

import { createClientAccess } from "../services/clientService";
import { sendChatMessage } from "../services/chatService";
import "../styles/clientAccess.css";

const ClientInvite = () => {
  const developerId =
    localStorage.getItem("userId") ||
    localStorage.getItem("developerId") ||
    "101";

  const developerName =
    localStorage.getItem("username") ||
    localStorage.getItem("developerName") ||
    "Developer";

  const [formData, setFormData] = useState({
    clientName: "",
    repoId: "",
    repoName: "",
    projectCode: "",
  });

  const [createdAccess, setCreatedAccess] = useState(null);
  const [starterChatCreated, setStarterChatCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generateCode = () => {
    const repoPart = formData.repoName
      ? formData.repoName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6)
      : "PROJ";

    const randomPart = Math.random().toString(36).substring(2, 8);
    const code = `${repoPart}-${randomPart}`.toUpperCase();

    setFormData((prev) => ({
      ...prev,
      projectCode: code,
    }));
  };

  const handleChange = (e) => {
    setError("");
    setCopied(false);
    setStarterChatCreated(false);

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getInviteLink = (projectCode) => {
    const origin = window.location.origin;
    return `${origin}/client-access?code=${encodeURIComponent(projectCode)}`;
  };

  const handleCreateInvite = async (e) => {
    e.preventDefault();

    const clientName = formData.clientName.trim();
    const repoId = formData.repoId.trim() || `repo_${Date.now()}`;
    const repoName = formData.repoName.trim();
    const projectCode = formData.projectCode.trim().toUpperCase();

    if (!clientName || !repoName || !projectCode) {
      setError("Please enter client name, repository name, and project code.");
      return;
    }

    const payload = {
      developer_id: String(developerId),
      developer_name: developerName,
      client_name: clientName,
      repo_id: repoId,
      repo_name: repoName,
      project_code: projectCode,
    };

    try {
      setLoading(true);
      setError("");
      setCopied(false);
      setStarterChatCreated(false);

      const response = await createClientAccess(payload);

      const accessData = response?.data || response;

      const finalAccessData = {
        ...accessData,
        client_id:
          accessData.client_id ||
          `client_${projectCode.replaceAll("-", "_")}`,
        project_code: accessData.project_code || projectCode,
        client_name: accessData.client_name || clientName,
        repo_id: accessData.repo_id || repoId,
        repo_name: accessData.repo_name || repoName,
        developer_id: accessData.developer_id || String(developerId),
        developer_name: accessData.developer_name || developerName,
      };

      setCreatedAccess(finalAccessData);

      await sendChatMessage({
        sender_id: String(finalAccessData.developer_id),
        sender_name: finalAccessData.developer_name,
        sender_role: "developer",
        receiver_id: finalAccessData.client_id,
        receiver_name: finalAccessData.client_name,
        repo_id: finalAccessData.repo_id,
        repo_name: finalAccessData.repo_name,
        commit_id: "",
        message: `Hello ${finalAccessData.client_name}, your project chat is ready for ${finalAccessData.repo_name}. You can discuss commits and required changes here.`,
      });

      setStarterChatCreated(true);
    } catch (error) {
      setError(
        error?.response?.data?.detail ||
          error.message ||
          "Failed to create client invite."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!createdAccess?.project_code) return;

    const inviteLink = getInviteLink(createdAccess.project_code);

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
    } catch {
      setCopied(false);
      alert("Copy failed. Please copy the link manually.");
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
            Client <span>Invite</span>
          </h1>

          <p>
            Generate a secure project access code and invite link for your
            client. The client can open the link, enter their name, and access
            commits and chat without a GitHub account.
          </p>

          <div className="client-feature-list">
            <div className="client-feature">
              <FaKey />
              <div>
                <h3>Project Code</h3>
                <p>Create a unique code for client project access.</p>
              </div>
            </div>

            <div className="client-feature">
              <FaExternalLinkAlt />
              <div>
                <h3>Invite Link</h3>
                <p>Share a direct link with auto-filled project code.</p>
              </div>
            </div>

            <div className="client-feature">
              <FaCodeBranch />
              <div>
                <h3>Commit Review</h3>
                <p>Client can review commits and discuss changes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="client-access-right">
          <form className="client-form" onSubmit={handleCreateInvite}>
            <h2>Create Client Invite</h2>

            <div className="client-form-group">
              <label>Client Name *</label>
              <div className="client-input-box">
                <FaUserTie />
                <input
                  type="text"
                  name="clientName"
                  placeholder="Example: Mr Ali"
                  value={formData.clientName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="client-form-group">
              <label>Repository ID (Optional)</label>
              <div className="client-input-box">
                <FaGithub />
                <input
                  type="text"
                  name="repoId"
                  placeholder="Example: repo_001 or leave empty"
                  value={formData.repoId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="client-form-group">
              <label>Repository / Project Name *</label>
              <div className="client-input-box">
                <FaCodeBranch />
                <input
                  type="text"
                  name="repoName"
                  placeholder="Example: github-repo-manager"
                  value={formData.repoName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="client-form-group">
              <label>Project Access Code *</label>
              <div className="client-input-box">
                <FaKey />
                <input
                  type="text"
                  name="projectCode"
                  placeholder="Example: GITCOLLAB-2026"
                  value={formData.projectCode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="button"
              className="client-access-btn"
              onClick={generateCode}
              disabled={loading}
            >
              <FaPlus />
              Generate Code
            </button>

            {error && <p className="client-error">{error}</p>}

            <button
              type="submit"
              className="client-access-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Invite"}
              <FaExternalLinkAlt />
            </button>

            {createdAccess && (
              <div className="client-note" style={{ textAlign: "left" }}>
                <strong>Invite Created</strong>
                <br />
                Client ID: {createdAccess.client_id}
                <br />
                Client: {createdAccess.client_name}
                <br />
                Developer: {createdAccess.developer_name}
                <br />
                Project: {createdAccess.repo_name}
                <br />
                Repo ID: {createdAccess.repo_id}
                <br />
                Code: {createdAccess.project_code}
                <br />
                Starter Chat: {starterChatCreated ? "Created" : "Not created"}
                <br />
                <br />
                <strong>Invite Link:</strong>
                <br />
                {getInviteLink(createdAccess.project_code)}
                <br />
                <br />
                <button
                  type="button"
                  className="client-access-btn"
                  onClick={handleCopyInvite}
                >
                  <FaCopy />
                  {copied ? "Copied!" : "Copy Invite Link"}
                </button>
              </div>
            )}

            <p className="client-note">
              Share this invite link with the client through WhatsApp, email, or
              any messaging app. A project chat will be created automatically.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientInvite;