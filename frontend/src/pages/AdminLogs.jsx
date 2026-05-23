import { useEffect, useState } from "react";
import {
  FaHistory,
  FaUserShield,
  FaBullseye,
  FaClock,
  FaSearch,
} from "react-icons/fa";

import { getAdminLogs } from "../services/adminService";

import "../styles/pages.css";
import "../styles/admin.css";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAdminLogs();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Admin logs error:", error);
      setMessage(error?.response?.data?.detail || "Failed to load admin logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionTypes = [
    "All",
    "USER_BLOCKED",
    "USER_UNBLOCKED",
    "CLIENT_ACCESS_REVOKED",
    "CLIENT_ACCESS_ACTIVATED",
    "HELP_POST_SOLVED",
    "COMMIT_STATUS_UPDATED",
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "All" || log.action_type === filter;

    const text = `${log.admin_name || ""} ${log.action_type || ""} ${
      log.target_type || ""
    } ${log.target_id || ""} ${log.description || ""}`;

    const matchesSearch = text.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const formatActionName = (action) => {
    if (!action) return "GENERAL";
    return action.replaceAll("_", " ");
  };

  const getActionBadgeClass = (action) => {
    if (action === "USER_BLOCKED") return "admin-badge admin-badge-danger";
    if (action === "CLIENT_ACCESS_REVOKED") return "admin-badge admin-badge-danger";
    if (action === "USER_UNBLOCKED") return "admin-badge admin-badge-success";
    if (action === "CLIENT_ACCESS_ACTIVATED") return "admin-badge admin-badge-success";
    if (action === "HELP_POST_SOLVED") return "admin-badge admin-badge-success";
    if (action === "COMMIT_STATUS_UPDATED") return "admin-badge";
    return "admin-badge";
  };

  return (
    <div className="page">
      <h1 className="page-title">
        Admin <span className="orange">Logs</span>
      </h1>
      <div className="underline"></div>

      <div className="admin-hero-card">
        <div>
          <h2>
            <FaHistory /> Admin Activity Logs
          </h2>
          <p>
            View all admin actions such as user block/unblock, client access
            revoke/activate, help post solved, and commit status changes.
          </p>
        </div>

        <button className="admin-refresh-btn" onClick={fetchLogs}>
          Refresh
        </button>
      </div>

      <div className="admin-filter-row">
        {actionTypes.map((item) => (
          <button
            key={item}
            className={
              filter === item ? "admin-filter-btn active" : "admin-filter-btn"
            }
            onClick={() => setFilter(item)}
          >
            {item === "All" ? "All" : formatActionName(item)}
          </button>
        ))}
      </div>

      <div className="admin-search-wrapper">
        <FaSearch />
        <input
          className="admin-search-input"
          type="text"
          placeholder="Search logs by admin, action, target, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {message && <p className="admin-error-message">{message}</p>}

      {loading ? (
        <p className="admin-empty-text">Loading admin logs...</p>
      ) : filteredLogs.length === 0 ? (
        <p className="admin-empty-text">No admin logs found.</p>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Description</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={
                    log.id ||
                    `${log.action_type}-${log.target_id}-${log.created_at}`
                  }
                >
                  <td>
                    <FaUserShield /> {log.admin_name || "Admin"}
                  </td>

                  <td>
                    <span className={getActionBadgeClass(log.action_type)}>
                      {formatActionName(log.action_type)}
                    </span>
                  </td>

                  <td>
                    <FaBullseye /> {log.target_type || "N/A"}
                    <br />
                    <small className="admin-muted-text">
                      {log.target_id || "N/A"}
                    </small>
                  </td>

                  <td>{log.description || "No description available."}</td>

                  <td>
                    <FaClock />{" "}
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;