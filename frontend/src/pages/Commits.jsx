import { useEffect, useState } from "react";
import {
  FaCodeBranch,
  FaCheck,
  FaTimes,
  FaCommentDots,
  FaClock,
  FaGithub,
  FaEye,
  FaUserCog,
  FaFileCode,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
  getAllCommitReviews,
  updateCommitReviewStatus,
} from "../services/commitService";

import "../styles/commit.css";

const Commits = () => {
  const navigate = useNavigate();

  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const formatDate = (value) => {
    if (!value) return { date: "N/A", time: "N/A" };

    const dateObj = new Date(value);

    if (Number.isNaN(dateObj.getTime())) {
      return { date: value, time: "" };
    }

    return {
      date: dateObj.toLocaleDateString(),
      time: dateObj.toLocaleTimeString(),
    };
  };

  const normalizeCommit = (commit) => {
    const formatted = formatDate(commit.created_at || commit.updated_at);

    return {
      id: commit.id,
      commitId: commit.commit_id || "",
      repoId: commit.repo_id || "",
      repoName: commit.repo_name || "Repository",
      repoLink: commit.repo_link || "",
      developerId: commit.developer_id || "",
      developer: commit.developer_name || "Developer",
      branch: commit.branch || "main",
      message: commit.message || "",
      changedFiles: Array.isArray(commit.changed_files)
        ? commit.changed_files
        : [],
      status: commit.status || "Pending Review",
      date: formatted.date,
      time: formatted.time,
      feedback: commit.feedback || "",
      priority: commit.priority || "Medium",
      commitType: commit.commit_type || "General",
      summary: commit.summary || "",
    };
  };

  const loadCommits = async () => {
    try {
      setLoading(true);

      const data = await getAllCommitReviews();

      const normalizedData = Array.isArray(data)
        ? data.map(normalizeCommit)
        : [];

      setCommits(normalizedData);
    } catch (error) {
      console.error("Failed to load commits:", error);
      alert("Failed to load commit reviews from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommits();
  }, []);

  const updateCommitStatus = async (commitId, status, customFeedback = "") => {
    const finalFeedback =
      customFeedback.trim() ||
      feedback.trim() ||
      "No feedback provided.";

    try {
      const updatedCommit = await updateCommitReviewStatus(commitId, {
        status,
        feedback: finalFeedback,
      });

      const normalizedCommit = normalizeCommit(updatedCommit);

      setCommits((prev) =>
        prev.map((commit) =>
          commit.commitId === commitId ? normalizedCommit : commit
        )
      );

      setSelectedCommit(null);
      setFeedback("");
    } catch (error) {
      console.error("Failed to update commit status:", error);
      alert(
        error?.response?.data?.detail ||
          "Failed to update commit review status."
      );
    }
  };

  const openReviewModal = (commit) => {
    setSelectedCommit(commit);
    setFeedback(commit.feedback || "");
  };

  const discussInChat = (commitId) => {
    navigate(`/chat?commit=${commitId}`);
  };

  const viewCommitDetails = (commitId) => {
    navigate(`/commits/${commitId}`);
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replaceAll(" ", "-");
  };

  const getStatusIcon = (status) => {
    if (status === "Approved") return <FaCheckCircle />;
    if (status === "Changes Requested") return <FaExclamationCircle />;
    return <FaClock />;
  };

  const filteredCommits =
    statusFilter === "All"
      ? commits
      : commits.filter((commit) => commit.status === statusFilter);

  const totalCommits = commits.length;
  const pendingCommits = commits.filter(
    (commit) => commit.status === "Pending Review"
  ).length;
  const approvedCommits = commits.filter(
    (commit) => commit.status === "Approved"
  ).length;
  const changesRequestedCommits = commits.filter(
    (commit) => commit.status === "Changes Requested"
  ).length;

  return (
    <div className="commits-page">
      <div className="commits-page-header">
        <div>
          <h1>
            Commit <span>Review Center</span>
          </h1>

          <p>
            Review developer commits, approve completed work, request changes,
            and start commit-based discussions with the developer.
          </p>
        </div>
      </div>

      <div className="commit-stats">
        <div className="stat-card">
          <h3>{totalCommits}</h3>
          <p>Total Commits</p>
        </div>

        <div className="stat-card">
          <h3>{pendingCommits}</h3>
          <p>Pending Review</p>
        </div>

        <div className="stat-card">
          <h3>{approvedCommits}</h3>
          <p>Approved</p>
        </div>

        <div className="stat-card">
          <h3>{changesRequestedCommits}</h3>
          <p>Changes Requested</p>
        </div>
      </div>

      <div className="commit-filter-bar">
        <button
          className={statusFilter === "All" ? "active" : ""}
          onClick={() => setStatusFilter("All")}
        >
          All
        </button>

        <button
          className={statusFilter === "Pending Review" ? "active" : ""}
          onClick={() => setStatusFilter("Pending Review")}
        >
          Pending Review
        </button>

        <button
          className={statusFilter === "Approved" ? "active" : ""}
          onClick={() => setStatusFilter("Approved")}
        >
          Approved
        </button>

        <button
          className={statusFilter === "Changes Requested" ? "active" : ""}
          onClick={() => setStatusFilter("Changes Requested")}
        >
          Changes Requested
        </button>
      </div>

      <div className="commits-list">
        {loading ? (
          <div className="no-commits">
            <h3>Loading commits...</h3>
            <p>Please wait while commit reviews are loaded from MongoDB.</p>
          </div>
        ) : filteredCommits.length > 0 ? (
          filteredCommits.map((commit) => (
            <div key={commit.commitId} className="commit-card">
              <div className="commit-card-header">
                <div>
                  <h2>{commit.message}</h2>

                  <p>
                    <FaGithub />
                    Repository: <strong>{commit.repoName}</strong>
                  </p>
                </div>

                <span
                  className={`commit-status ${getStatusClass(commit.status)}`}
                >
                  {getStatusIcon(commit.status)}
                  {commit.status}
                </span>
              </div>

              <div className="commit-meta">
                <span>
                  <FaCodeBranch />
                  Commit ID: {commit.commitId}
                </span>

                <span>
                  <FaCodeBranch />
                  Branch: {commit.branch}
                </span>

                <span>
                  <FaUserCog />
                  Developer: {commit.developer}
                </span>

                <span>
                  <FaClock />
                  {commit.date} - {commit.time}
                </span>
              </div>

              <div className="commit-extra-info">
                <span>Type: {commit.commitType}</span>
                <span>Priority: {commit.priority}</span>
              </div>

              <div className="changed-files">
                <h4>
                  <FaFileCode />
                  Changed Files
                </h4>

                <div className="file-tags">
                  {commit.changedFiles.length > 0 ? (
                    commit.changedFiles.map((file) => (
                      <span key={file.name || file}>{file.name || file}</span>
                    ))
                  ) : (
                    <span>No changed files added</span>
                  )}
                </div>
              </div>

              {commit.feedback && (
                <div className="commit-feedback">
                  <h4>Client Feedback</h4>
                  <p>{commit.feedback}</p>
                </div>
              )}

              <div className="commit-actions">
                <button
                  className="approve-btn"
                  onClick={() =>
                    updateCommitStatus(
                      commit.commitId,
                      "Approved",
                      "Commit approved by client."
                    )
                  }
                >
                  <FaCheck />
                  Approve
                </button>

                <button
                  className="request-btn"
                  onClick={() => openReviewModal(commit)}
                >
                  <FaTimes />
                  Request Changes
                </button>

                <button
                  className="chat-btn"
                  onClick={() => discussInChat(commit.commitId)}
                >
                  <FaCommentDots />
                  Discuss in Chat
                </button>

                <button
                  className="details-btn"
                  onClick={() => viewCommitDetails(commit.commitId)}
                >
                  <FaEye />
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-commits">
            <h3>No commits found</h3>
            <p>No commits match the selected filter.</p>
          </div>
        )}
      </div>

      {selectedCommit && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <h2>Request Changes</h2>

            <div className="review-commit-info">
              <p>
                Commit: <strong>{selectedCommit.commitId}</strong>
              </p>

              <p>
                Repository: <strong>{selectedCommit.repoName}</strong>
              </p>

              <p>
                Developer: <strong>{selectedCommit.developer}</strong>
              </p>

              <p>
                Message: <strong>{selectedCommit.message}</strong>
              </p>
            </div>

            <textarea
              placeholder="Write clear feedback for the developer..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setSelectedCommit(null);
                  setFeedback("");
                }}
              >
                Cancel
              </button>

              <button
                className="submit-review-btn"
                onClick={() =>
                  updateCommitStatus(
                    selectedCommit.commitId,
                    "Changes Requested",
                    feedback
                  )
                }
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commits;