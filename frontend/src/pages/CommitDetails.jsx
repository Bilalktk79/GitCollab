import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCodeBranch,
  FaGithub,
  FaClock,
  FaUserCog,
  FaFileCode,
  FaCheck,
  FaTimes,
  FaCommentDots,
  FaExternalLinkAlt,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getCommitReviewByCommitId,
  updateCommitReviewStatus,
} from "../services/commitService";

import "../styles/commit.css";

const CommitDetails = () => {
  const { commitId } = useParams();
  const navigate = useNavigate();

  const [commit, setCommit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedback, setFeedback] = useState("");

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

  const normalizeCommit = (data) => {
    const formatted = formatDate(data.created_at || data.updated_at);

    return {
      id: data.id,
      commitId: data.commit_id || "",
      repoId: data.repo_id || "",
      repoName: data.repo_name || "Repository",
      repoLink: data.repo_link || "",
      developerId: data.developer_id || "",
      developer: data.developer_name || "Developer",
      branch: data.branch || "main",
      message: data.message || "",
      changedFiles: Array.isArray(data.changed_files)
        ? data.changed_files
        : [],
      status: data.status || "Pending Review",
      date: formatted.date,
      time: formatted.time,
      feedback: data.feedback || "",
      priority: data.priority || "Medium",
      commitType: data.commit_type || "General",
      summary: data.summary || "",
    };
  };

  const loadCommitDetails = async () => {
    try {
      setLoading(true);

      const data = await getCommitReviewByCommitId(commitId);
      const normalizedCommit = normalizeCommit(data);

      setCommit(normalizedCommit);
      setFeedback(normalizedCommit.feedback || "");
    } catch (error) {
      console.error("Failed to load commit details:", error);
      alert(
        error?.response?.data?.detail ||
          "Failed to load commit details from backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommitDetails();
  }, [commitId]);

  const getStatusIcon = (status) => {
    if (status === "Approved") return <FaCheckCircle />;
    if (status === "Changes Requested") return <FaExclamationCircle />;
    return <FaClock />;
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replaceAll(" ", "-");
  };

  const handleBack = () => {
    navigate("/commits");
  };

  const handleDiscussInChat = () => {
    navigate(`/chat?commit=${commit.commitId}`);
  };

  const handleApprove = async () => {
    try {
      const updatedCommit = await updateCommitReviewStatus(commit.commitId, {
        status: "Approved",
        feedback: "Commit approved by client.",
      });

      const normalizedCommit = normalizeCommit(updatedCommit);
      setCommit(normalizedCommit);
      setFeedback(normalizedCommit.feedback || "");
      setShowFeedbackBox(false);
    } catch (error) {
      console.error("Failed to approve commit:", error);
      alert(
        error?.response?.data?.detail ||
          "Failed to approve commit. Please try again."
      );
    }
  };

  const handleRequestChanges = async () => {
    if (!feedback.trim()) {
      alert("Please write feedback before submitting change request.");
      return;
    }

    try {
      const updatedCommit = await updateCommitReviewStatus(commit.commitId, {
        status: "Changes Requested",
        feedback: feedback.trim(),
      });

      const normalizedCommit = normalizeCommit(updatedCommit);
      setCommit(normalizedCommit);
      setFeedback(normalizedCommit.feedback || "");
      setShowFeedbackBox(false);
    } catch (error) {
      console.error("Failed to request changes:", error);
      alert(
        error?.response?.data?.detail ||
          "Failed to submit change request. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="commits-page">
        <div className="no-commits">
          <h3>Loading commit details...</h3>
          <p>Please wait while data is loaded from MongoDB.</p>
        </div>
      </div>
    );
  }

  if (!commit) {
    return (
      <div className="commits-page">
        <div className="no-commits">
          <h3>Commit not found</h3>
          <p>This commit review does not exist in backend.</p>
          <button className="back-btn" onClick={handleBack}>
            <FaArrowLeft />
            Back to Commits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="commits-page">
      <div className="commits-page-header">
        <div>
          <button className="back-btn" onClick={handleBack}>
            <FaArrowLeft />
            Back to Commits
          </button>

          <h1>
            Commit <span>Details</span>
          </h1>

          <p>
            Analyze commit information, changed files, client feedback, and
            discuss this commit directly with the developer.
          </p>
        </div>
      </div>

      <div className="commit-details-wrapper">
        <div className="commit-details-card">
          <div className="commit-card-header">
            <div>
              <h2>{commit.message}</h2>

              <p>
                <FaGithub />
                Repository: <strong>{commit.repoName}</strong>
              </p>
            </div>

            <span className={`commit-status ${getStatusClass(commit.status)}`}>
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

          <div className="commit-summary-box">
            <h4>Commit Summary</h4>
            <p>
              {commit.summary ||
                "No summary added for this commit review yet."}
            </p>
          </div>

          <div className="changed-files">
            <h4>
              <FaFileCode />
              Changed Files
            </h4>

            <div className="commit-file-list">
              {commit.changedFiles.length > 0 ? (
                commit.changedFiles.map((file) => (
                  <div className="commit-file-card" key={file.name || file}>
                    <div className="file-icon">
                      <FaFileCode />
                    </div>

                    <div>
                      <h3>{file.name || file}</h3>
                      <span>{file.type || "Modified"}</span>
                      <p>{file.description || "No description provided."}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No changed files added for this commit.</p>
              )}
            </div>
          </div>

          <div className="commit-feedback">
            <h4>Client Feedback</h4>

            {commit.feedback ? (
              <p>{commit.feedback}</p>
            ) : (
              <p>
                No feedback has been submitted yet. The client can review this
                commit and request changes if needed.
              </p>
            )}
          </div>

          {showFeedbackBox && (
            <div className="commit-feedback">
              <h4>Request Changes Feedback</h4>

              <textarea
                placeholder="Write clear feedback for the developer..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowFeedbackBox(false);
                    setFeedback(commit.feedback || "");
                  }}
                >
                  Cancel
                </button>

                <button
                  className="submit-review-btn"
                  onClick={handleRequestChanges}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          )}

          <div className="commit-actions">
            <button className="approve-btn" onClick={handleApprove}>
              <FaCheck />
              Approve Commit
            </button>

            <button
              className="request-btn"
              onClick={() => setShowFeedbackBox(true)}
            >
              <FaTimes />
              Request Changes
            </button>

            <button className="chat-btn" onClick={handleDiscussInChat}>
              <FaCommentDots />
              Discuss in Chat
            </button>

            {commit.repoLink && (
              <a
                className="details-btn"
                href={commit.repoLink}
                target="_blank"
                rel="noreferrer"
              >
                <FaExternalLinkAlt />
                View Repository
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitDetails;