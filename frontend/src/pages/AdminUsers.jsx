import { useEffect, useState } from "react";
import {
  FaUsers,
  FaEnvelope,
  FaUserShield,
  FaBan,
  FaUnlock,
  FaUserCheck,
} from "react-icons/fa";

import {
  getAdminUsers,
  blockAdminUser,
  unblockAdminUser,
} from "../services/adminService";

import "../styles/pages.css";
import "../styles/admin.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const currentUsername = localStorage.getItem("username");
  const currentRole = localStorage.getItem("user_role");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const data = await getAdminUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Admin users error:", error);

      setUsers([]);
      setMessage(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to load users."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setSearch("");
    await fetchUsers();
  };

  const handleBlockUser = async (user) => {
    const userId = user?.id;
    const username = user?.username || user?.name || "this user";

    if (!userId) {
      setMessage("Invalid user id. Cannot block this user.");
      setMessageType("error");
      return;
    }

    if (user?.username === currentUsername) {
      setMessage("You cannot block your own admin account.");
      setMessageType("error");
      return;
    }

    const confirmBlock = window.confirm(
      `Are you sure you want to block ${username}?`
    );

    if (!confirmBlock) return;

    try {
      setActionLoading(userId);
      setMessage("");
      setMessageType("");

      await blockAdminUser(userId);

      setMessage(`${username} blocked successfully.`);
      setMessageType("success");

      await fetchUsers();
    } catch (error) {
      console.error("Block user error:", error);

      setMessage(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to block user."
      );
      setMessageType("error");
    } finally {
      setActionLoading("");
    }
  };

  const handleUnblockUser = async (user) => {
    const userId = user?.id;
    const username = user?.username || user?.name || "this user";

    if (!userId) {
      setMessage("Invalid user id. Cannot unblock this user.");
      setMessageType("error");
      return;
    }

    try {
      setActionLoading(userId);
      setMessage("");
      setMessageType("");

      await unblockAdminUser(userId);

      setMessage(`${username} unblocked successfully.`);
      setMessageType("success");

      await fetchUsers();
    } catch (error) {
      console.error("Unblock user error:", error);

      setMessage(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to unblock user."
      );
      setMessageType("error");
    } finally {
      setActionLoading("");
    }
  };

  const filteredUsers = users.filter((user) => {
    const text = `${user.username || ""} ${user.name || ""} ${
      user.email || ""
    } ${user.role || user.user_role || ""}`;

    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <h1 className="page-title">
        Admin <span className="orange">Users</span>
      </h1>
      <div className="underline"></div>

      <div className="admin-hero-card">
        <div>
          <h2>
            <FaUsers /> User Management
          </h2>
          <p>
            View all registered developers, clients, and admin-related users.
          </p>

          <p className="admin-small-info">
            Logged in as: <strong>{currentUsername || "Unknown"}</strong>{" "}
            {currentRole && <span>({currentRole})</span>}
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <input
        className="admin-search-input"
        type="text"
        placeholder="Search users by name, email, username or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {message && (
        <p
          className={
            messageType === "success"
              ? "admin-success-message"
              : "admin-error-message"
          }
        >
          {message}
        </p>
      )}

      {loading ? (
        <p className="admin-empty-text">Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p className="admin-empty-text">No users found.</p>
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const userId = user.id;
                const username =
                  user.username ||
                  user.name ||
                  user.full_name ||
                  "Unknown User";

                const role = user.role || user.user_role || "developer";
                const isBlocked = user.is_blocked === true;
                const isCurrentActionLoading = actionLoading === userId;
                const isCurrentAdmin = user.username === currentUsername;

                return (
                  <tr key={user.id || user.username || user.email}>
                    <td>
                      <FaUserShield /> {username}
                    </td>

                    <td>
                      <FaEnvelope /> {user.email || "N/A"}
                    </td>

                    <td>
                      <span className="admin-badge">{role}</span>
                    </td>

                    <td>
                      <span
                        className={
                          isBlocked
                            ? "admin-badge admin-badge-danger"
                            : "admin-badge admin-badge-success"
                        }
                      >
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleString()
                        : "N/A"}
                    </td>

                    <td>
                      {isCurrentAdmin ? (
                        <span className="admin-current-user-badge">
                          <FaUserCheck /> Current Admin
                        </span>
                      ) : isBlocked ? (
                        <button
                          className="admin-action-btn admin-action-success"
                          disabled={isCurrentActionLoading || !userId}
                          onClick={() => handleUnblockUser(user)}
                        >
                          <FaUnlock />{" "}
                          {isCurrentActionLoading ? "Working..." : "Unblock"}
                        </button>
                      ) : (
                        <button
                          className="admin-action-btn admin-action-danger"
                          disabled={isCurrentActionLoading || !userId}
                          onClick={() => handleBlockUser(user)}
                        >
                          <FaBan />{" "}
                          {isCurrentActionLoading ? "Working..." : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;