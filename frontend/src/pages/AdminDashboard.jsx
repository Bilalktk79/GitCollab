import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaGithub,
  FaCodeBranch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaComments,
  FaHandsHelping,
  FaBell,
  FaUserShield,
  FaKey,
  FaSyncAlt,
} from "react-icons/fa";

import { getAdminDashboard } from "../services/adminService";

import "../styles/pages.css";
import "../styles/admin.css";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAdminDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      setMessage(
        error?.response?.data?.detail ||
          "Failed to load admin dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const stats = dashboardData?.stats || {};
  const recentCommits = dashboardData?.recent_commits || [];
  const recentClients = dashboardData?.recent_clients || [];
  const recentHelpPosts = dashboardData?.recent_help_posts || [];

  const statCards = [
    {
      title: "Total Users",
      value: stats.total_users || 0,
      icon: <FaUsers />,
    },
    {
      title: "Repositories",
      value: stats.total_repositories || 0,
      icon: <FaGithub />,
    },
    {
      title: "Commit Reviews",
      value: stats.total_commit_reviews || 0,
      icon: <FaCodeBranch />,
    },
    {
      title: "Pending Reviews",
      value: stats.pending_reviews || 0,
      icon: <FaExclamationTriangle />,
    },
    {
      title: "Approved Commits",
      value: stats.approved_commits || 0,
      icon: <FaCheckCircle />,
    },
    {
      title: "Changes Requested",
      value: stats.changes_requested || 0,
      icon: <FaExclamationTriangle />,
    },
    {
      title: "Client Access",
      value: stats.total_client_access || 0,
      icon: <FaKey />,
    },
    {
      title: "Help Posts",
      value: stats.total_help_posts || 0,
      icon: <FaHandsHelping />,
    },
    {
      title: "Chats",
      value: stats.total_chats || 0,
      icon: <FaComments />,
    },
    {
      title: "Notifications",
      value: stats.total_notifications || 0,
      icon: <FaBell />,
    },
  ];

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">
          Admin <span className="orange">Dashboard</span>
        </h1>
        <div className="underline"></div>
        <p className="admin-empty-text">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">
        Admin <span className="orange">Dashboard</span>
      </h1>
      <div className="underline"></div>

      {message && <p className="admin-error-message">{message}</p>}

      <div className="admin-hero-card">
        <div>
          <h2>
            <FaUserShield /> System Overview
          </h2>
          <p>
            Admin can monitor users, repositories, commit reviews, client
            access, help room activity, chats and notifications from one place.
          </p>
        </div>

        <button className="admin-refresh-btn" onClick={fetchAdminDashboard}>
          <FaSyncAlt /> Refresh
        </button>
      </div>

      <div className="admin-stats-grid">
        {statCards.map((card, index) => (
          <div className="admin-stat-card" key={index}>
            <div className="admin-stat-icon">{card.icon}</div>
            <div>
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <Link to="/admin/users" className="admin-primary-link">
          Manage Users
        </Link>

        <Link to="/admin/commits" className="admin-secondary-link">
          View Commit Reviews
        </Link>

        <Link to="/admin/repos" className="admin-secondary-link">
          View Repositories
        </Link>

        <Link to="/admin/clients" className="admin-secondary-link">
          Client Access
        </Link>

        <Link to="/admin/help" className="admin-secondary-link">
          Help Room
        </Link>

        <Link to="/admin/logs" className="admin-secondary-link">
          System Logs
        </Link>
      </div>

      <div className="admin-section-grid">
        <div className="admin-section-card">
          <h2>Recent Commit Reviews</h2>

          {recentCommits.length === 0 ? (
            <p className="admin-empty-text">No recent commits found.</p>
          ) : (
            recentCommits.map((commit) => (
              <div className="admin-list-item" key={commit.id}>
                <h4>{commit.repo_name || "Unknown Repo"}</h4>
                <p>{commit.message || "No commit message"}</p>
                <span>Status: {commit.status || "Pending Review"}</span>
              </div>
            ))
          )}
        </div>

        <div className="admin-section-card">
          <h2>Recent Client Access</h2>

          {recentClients.length === 0 ? (
            <p className="admin-empty-text">No client access records found.</p>
          ) : (
            recentClients.map((client) => (
              <div className="admin-list-item" key={client.id}>
                <h4>{client.client_name || "Unnamed Client"}</h4>
                <p>Repo: {client.repo_name || "No repo linked"}</p>
                <span>
                  Code: {client.project_code || "N/A"} |{" "}
                  {client.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="admin-section-card">
          <h2>Recent Help Posts</h2>

          {recentHelpPosts.length === 0 ? (
            <p className="admin-empty-text">No help posts found.</p>
          ) : (
            recentHelpPosts.map((post) => (
              <div className="admin-list-item" key={post.id}>
                <h4>{post.title || "Untitled Issue"}</h4>
                <p>{post.issue_type || "General"} issue</p>
                <span>Status: {post.status || "Open"}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;