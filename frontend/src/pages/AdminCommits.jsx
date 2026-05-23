import { useEffect, useState } from "react";
import {
  FaCodeBranch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUndo,
} from "react-icons/fa";

import {
  getAdminCommits,
  updateAdminCommitStatus,
} from "../services/adminService";

import "../styles/pages.css";
import "../styles/admin.css";

const AdminCommits = () => {
  const [commits, setCommits] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");

  const fetchCommits = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAdminCommits();
      setCommits(data.commits || []);
    } catch (error) {
      console.error("Admin commits error:", error);
      setMessage(
        error?.response?.data?.detail || "Failed to load commit reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommits();
  }, []);

  const handleStatusUpdate = async (commitId, status) => {
    try {
      setActionLoading(`${commitId}-${status}`);
      setMessage("");

      await updateAdminCommitStatus(commitId, status);

      setMessage(`Commit status updated to ${status}.`);
      await fetchCommits();
    } catch (error) {
      console.error("Update commit status error:", error);
      setMessage(
        error?.response?.data?.detail || "Failed to update commit status."
      );
    } finally {
      setActionLoading("");
    }
  };

  const filteredCommits = commits.filter((commit) => {
    const matchesFilter = filter === "All" || commit.status === filter;

    const text = `${commit.repo_name || ""} ${commit.message || ""} ${
      commit.commit_id || ""
    } ${commit.developer_name || ""}`;

    const matchesSearch = text.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    if (status === "Approved") return <FaCheckCircle />;
    if (status === "Changes Requested") return <FaExclamationTriangle />;
    return <FaCodeBranch />;
  };

  const getStatusClass = (status) => {
    if (status === "Approved") return "approved";
    if (status === "Changes Requested") return "changes";
    return "pending";
  };

  return (
    <div className="page">
      <h1 className="page-title">
        Admin <span className="orange">Commit Reviews</span>
      </h1>
      <div className="underline"></div>

      <div className="admin-hero-card">
        <div>
          <h2>
            <FaCodeBranch /> Commit Review Monitoring
          </h2>
          <p>
            View all commit reviews, statuses, feedback, developers and changed
            files.
          </p>
        </div>

        <button className="admin-refresh-btn" onClick={fetchCommits}>
          Refresh
        </button>
      </div>

      <div className="admin-filter-row">
        {["All", "Pending Review", "Approved", "Changes Requested"].map(
          (item) => (
            <button
              key={item}
              className={
                filter === item ? "admin-filter-btn active" : "admin-filter-btn"
              }
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          )
        )}
      </div>

      <input
        className="admin-search-input"
        type="text"
        placeholder="Search commits by repo, message, developer or commit ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {message && <p className="admin-error-message">{message}</p>}

      {loading ? (
        <p className="admin-empty-text">Loading commit reviews...</p>
      ) : filteredCommits.length === 0 ? (
        <p className="admin-empty-text">No commit reviews found.</p>
      ) : (
        <div className="admin-section-grid">
          {filteredCommits.map((commit) => {
            const commitId = commit.id;
            const currentStatus = commit.status || "Pending Review";

            const pendingLoading =
              actionLoading === `${commitId}-Pending Review`;
            const approveLoading = actionLoading === `${commitId}-Approved`;
            const changesLoading =
              actionLoading === `${commitId}-Changes Requested`;

            return (
              <div
                className="admin-section-card"
                key={commit.id || commit.commit_id}
              >
                <h2>{commit.message || "No message"}</h2>

                <p className="admin-muted-text">
                  Repo: {commit.repo_name || "N/A"}
                </p>

                <p className="admin-muted-text">
                  Developer: {commit.developer_name || "N/A"}
                </p>

                <p className="admin-muted-text">
                  Branch: {commit.branch || "main"}
                </p>

                <p className="admin-muted-text">
                  Commit ID: {commit.commit_id || "N/A"}
                </p>

                <span
                  className={`admin-status ${getStatusClass(currentStatus)}`}
                >
                  {getStatusIcon(currentStatus)} {currentStatus}
                </span>

                <div className="admin-card-actions">
                  <button
                    className="admin-action-btn admin-action-neutral"
                    disabled={
                      !commitId ||
                      currentStatus === "Pending Review" ||
                      pendingLoading
                    }
                    onClick={() =>
                      handleStatusUpdate(commitId, "Pending Review")
                    }
                  >
                    <FaUndo /> {pendingLoading ? "Working..." : "Reset Pending"}
                  </button>

                  <button
                    className="admin-action-btn admin-action-success"
                    disabled={
                      !commitId || currentStatus === "Approved" || approveLoading
                    }
                    onClick={() => handleStatusUpdate(commitId, "Approved")}
                  >
                    <FaCheckCircle />{" "}
                    {approveLoading ? "Working..." : "Approve"}
                  </button>

                  <button
                    className="admin-action-btn admin-action-warning"
                    disabled={
                      !commitId ||
                      currentStatus === "Changes Requested" ||
                      changesLoading
                    }
                    onClick={() =>
                      handleStatusUpdate(commitId, "Changes Requested")
                    }
                  >
                    <FaExclamationTriangle />{" "}
                    {changesLoading ? "Working..." : "Request Changes"}
                  </button>
                </div>

                <div className="admin-mini-list">
                  <strong>Changed Files:</strong>

                  {(commit.changed_files || []).length === 0 ? (
                    <p>No files listed</p>
                  ) : (
                    commit.changed_files.map((file, index) => (
                      <p key={index}>{file.name || file.filename || "Unnamed file"}</p>
                    ))
                  )}
                </div>

                {commit.feedback && (
                  <div className="admin-feedback-box">
                    <strong>Feedback:</strong>
                    <p>{commit.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCommits;