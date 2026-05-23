import { useEffect, useState } from "react";
import {
  FaKey,
  FaUser,
  FaFolderOpen,
  FaBan,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getAdminClients,
  revokeAdminClientAccess,
  activateAdminClientAccess,
} from "../services/adminService";

import "../styles/pages.css";
import "../styles/admin.css";

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAdminClients();
      setClients(data.clients || []);
    } catch (error) {
      console.error("Admin clients error:", error);
      setMessage(
        error?.response?.data?.detail ||
          "Failed to load client access records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleRevokeClient = async (clientId) => {
    try {
      setActionLoading(clientId);
      setMessage("");

      await revokeAdminClientAccess(clientId);

      setMessage("Client access revoked successfully.");
      await fetchClients();
    } catch (error) {
      console.error("Revoke client access error:", error);
      setMessage(
        error?.response?.data?.detail || "Failed to revoke client access."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleActivateClient = async (clientId) => {
    try {
      setActionLoading(clientId);
      setMessage("");

      await activateAdminClientAccess(clientId);

      setMessage("Client access activated successfully.");
      await fetchClients();
    } catch (error) {
      console.error("Activate client access error:", error);
      setMessage(
        error?.response?.data?.detail || "Failed to activate client access."
      );
    } finally {
      setActionLoading("");
    }
  };

  const filteredClients = clients.filter((client) => {
    const text = `${client.client_name || ""} ${client.project_code || ""} ${
      client.repo_name || ""
    } ${client.developer_name || ""}`;

    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <h1 className="page-title">
        Admin <span className="orange">Client Access</span>
      </h1>
      <div className="underline"></div>

      <div className="admin-hero-card">
        <div>
          <h2>
            <FaKey /> Client Access Management
          </h2>
          <p>
            Monitor client invite codes, linked repositories, access status and
            developers.
          </p>
        </div>

        <button className="admin-refresh-btn" onClick={fetchClients}>
          Refresh
        </button>
      </div>

      <input
        className="admin-search-input"
        type="text"
        placeholder="Search by client, project code, repo or developer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {message && <p className="admin-error-message">{message}</p>}

      {loading ? (
        <p className="admin-empty-text">Loading client access records...</p>
      ) : filteredClients.length === 0 ? (
        <p className="admin-empty-text">No client access records found.</p>
      ) : (
        <div className="admin-section-grid">
          {filteredClients.map((client) => {
            const clientId = client.id;
            const isActive = client.is_active === true;
            const isCurrentActionLoading = actionLoading === clientId;

            return (
              <div
                className="admin-section-card"
                key={client.id || client.client_id || client.project_code}
              >
                <h2>
                  <FaUser /> {client.client_name || "Unnamed Client"}
                </h2>

                <p className="admin-muted-text">
                  <FaFolderOpen /> Repo: {client.repo_name || "N/A"}
                </p>

                <p className="admin-muted-text">
                  Developer: {client.developer_name || "N/A"}
                </p>

                <p className="admin-muted-text">
                  Project Code:{" "}
                  <span className="admin-code-text">
                    {client.project_code || "N/A"}
                  </span>
                </p>

                <p className="admin-muted-text">
                  Status:{" "}
                  <span
                    className={
                      isActive
                        ? "admin-badge admin-badge-success"
                        : "admin-badge admin-badge-danger"
                    }
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </p>

                <p className="admin-muted-text">
                  Last Access:{" "}
                  {client.last_accessed_at
                    ? new Date(client.last_accessed_at).toLocaleString()
                    : "Not accessed yet"}
                </p>

                <div className="admin-card-actions">
                  {isActive ? (
                    <button
                      className="admin-action-btn admin-action-danger"
                      disabled={isCurrentActionLoading || !clientId}
                      onClick={() => handleRevokeClient(clientId)}
                    >
                      <FaBan />{" "}
                      {isCurrentActionLoading ? "Working..." : "Revoke"}
                    </button>
                  ) : (
                    <button
                      className="admin-action-btn admin-action-success"
                      disabled={isCurrentActionLoading || !clientId}
                      onClick={() => handleActivateClient(clientId)}
                    >
                      <FaCheckCircle />{" "}
                      {isCurrentActionLoading ? "Working..." : "Activate"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminClients;