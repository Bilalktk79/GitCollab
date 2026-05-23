import { useEffect, useState } from "react";
import {
  FaGithub,
  FaPlus,
  FaCheckCircle,
  FaComments,
  FaExternalLinkAlt,
  FaSearch,
  FaCodeBranch,
  FaFileCode,
  FaBug,
  FaReply,
  FaUserCog,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

import {
  createHelpPost,
  getHelpPosts,
  replyToHelpPost,
  markHelpPostSolved,
} from "../services/helpService";

import "../styles/help.css";

const HelpRoom = () => {
  const currentDeveloper = {
    id:
      localStorage.getItem("userId") ||
      localStorage.getItem("developerId") ||
      "101",
    name:
      localStorage.getItem("username") ||
      localStorage.getItem("developerName") ||
      "Developer",
  };

  const [formData, setFormData] = useState({
    title: "",
    repoLink: "",
    filePath: "",
    commitId: "",
    issueType: "",
    errorMessage: "",
    description: "",
    codeSnippet: "",
  });

  const [replyText, setReplyText] = useState({});
  const [expandedPosts, setExpandedPosts] = useState({});
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [helpPosts, setHelpPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const formatDate = (value) => {
    if (!value) return "Just now";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const normalizeReply = (reply) => {
    return {
      id: reply.id,
      developerName: reply.sender_name || "Developer",
      message: reply.reply_message || "",
      codeSnippet: reply.code_snippet || "",
      createdAt: formatDate(reply.created_at),
    };
  };

  const normalizePost = (post) => {
    return {
      id: post.id,
      developerId: post.developer_id,
      developerName: post.developer_name || "Developer",
      title: post.title || "",
      repoLink: post.repo_link || "",
      filePath: post.file_path || "",
      commitId: post.commit_id || "",
      issueType: post.issue_type || "Other",
      errorMessage: post.error_message || "",
      description: post.description || "",
      codeSnippet: post.code_snippet || "",
      status: post.status || "Open",
      createdAt: formatDate(post.created_at),
      replies: Array.isArray(post.replies)
        ? post.replies.map(normalizeReply)
        : [],
    };
  };

  const loadHelpPosts = async () => {
    try {
      setLoading(true);

      const data = await getHelpPosts();

      const normalizedData = Array.isArray(data)
        ? data.map(normalizePost)
        : [];

      setHelpPosts(normalizedData);
    } catch (error) {
      console.error("Failed to load help posts:", error);
      alert("Failed to load help posts from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHelpPosts();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      repoLink: "",
      filePath: "",
      commitId: "",
      issueType: "",
      errorMessage: "",
      description: "",
      codeSnippet: "",
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.repoLink.trim() ||
      !formData.issueType.trim() ||
      !formData.description.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      developer_id: String(currentDeveloper.id),
      developer_name: currentDeveloper.name,
      title: formData.title.trim(),
      repo_link: formData.repoLink.trim(),
      file_path: formData.filePath.trim(),
      commit_id: formData.commitId.trim(),
      issue_type: formData.issueType,
      error_message: formData.errorMessage.trim(),
      description: formData.description.trim(),
      code_snippet: formData.codeSnippet.trim(),
    };

    try {
      setPosting(true);

      const createdPost = await createHelpPost(payload);
      const normalizedPost = normalizePost(createdPost);

      setHelpPosts((prev) => [normalizedPost, ...prev]);

      setExpandedPosts((prev) => ({
        ...prev,
        [normalizedPost.id]: true,
      }));

      resetForm();
    } catch (error) {
      console.error("Failed to create help post:", error);
      alert(
        error?.response?.data?.detail ||
          "Failed to publish issue. Please try again."
      );
    } finally {
      setPosting(false);
    }
  };

  const markAsSolved = async (postId) => {
    try {
      const updatedPost = await markHelpPostSolved(postId);
      const normalizedPost = normalizePost(updatedPost);

      setHelpPosts((prev) =>
        prev.map((post) => (post.id === postId ? normalizedPost : post))
      );
    } catch (error) {
      console.error("Failed to mark post solved:", error);
      alert(
        error?.response?.data?.detail ||
          "Failed to mark issue as solved. Please try again."
      );
    }
  };

  const toggleReplies = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleReplyChange = (postId, value) => {
    setReplyText((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleAddReply = async (postId) => {
    const message = replyText[postId]?.trim();

    if (!message) {
      alert("Please write a reply before submitting.");
      return;
    }

    const payload = {
      sender_id: String(currentDeveloper.id),
      sender_name: currentDeveloper.name,
      reply_message: message,
      code_snippet: "",
    };

    try {
      const createdReply = await replyToHelpPost(postId, payload);
      const normalizedReply = normalizeReply(createdReply);

      setHelpPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                replies: [...post.replies, normalizedReply],
              }
            : post
        )
      );

      setReplyText((prev) => ({
        ...prev,
        [postId]: "",
      }));

      setExpandedPosts((prev) => ({
        ...prev,
        [postId]: true,
      }));
    } catch (error) {
      console.error("Failed to add reply:", error);
      alert(
        error?.response?.data?.detail ||
          "Failed to submit reply. Please try again."
      );
    }
  };

  const filteredPosts = helpPosts.filter((post) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      post.title.toLowerCase().includes(search) ||
      post.repoLink.toLowerCase().includes(search) ||
      post.filePath.toLowerCase().includes(search) ||
      post.commitId.toLowerCase().includes(search) ||
      post.issueType.toLowerCase().includes(search) ||
      post.description.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" || post.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openIssues = helpPosts.filter((post) => post.status === "Open").length;
  const solvedIssues = helpPosts.filter(
    (post) => post.status === "Solved"
  ).length;

  return (
    <div className="help-page">
      <div className="help-page-header">
        <div>
          <h1>
            Developer <span>Help Room</span>
          </h1>

          <p>
            Share public repository, file, code, or commit issues and get help
            from other developers logged in through this platform.
          </p>
        </div>

        <div className="help-summary">
          <div className="help-summary-card">
            <h3>{helpPosts.length}</h3>
            <p>Total Issues</p>
          </div>

          <div className="help-summary-card">
            <h3>{openIssues}</h3>
            <p>Open</p>
          </div>

          <div className="help-summary-card">
            <h3>{solvedIssues}</h3>
            <p>Solved</p>
          </div>
        </div>
      </div>

      <div className="help-layout">
        <section className="help-form-card">
          <h2>
            <FaPlus />
            Post Developer Issue
          </h2>

          <form onSubmit={handleCreatePost}>
            <div className="form-group">
              <label>Issue Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Example: FastAPI token error"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Public Repository Link *</label>
              <input
                type="url"
                name="repoLink"
                placeholder="https://github.com/username/repository"
                value={formData.repoLink}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>File Name / Path</label>
              <input
                type="text"
                name="filePath"
                placeholder="backend/app/controllers/file_controller.py"
                value={formData.filePath}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Commit ID</label>
              <input
                type="text"
                name="commitId"
                placeholder="Example: a7f21c9"
                value={formData.commitId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Issue Type *</label>
              <select
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
              >
                <option value="">Select issue type</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend API">Backend API</option>
                <option value="Database">Database</option>
                <option value="GitHub API">GitHub API</option>
                <option value="Authentication">Authentication</option>
                <option value="Commit Issue">Commit Issue</option>
                <option value="File Upload">File Upload</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Error Message</label>
              <input
                type="text"
                name="errorMessage"
                placeholder="Paste short error message here"
                value={formData.errorMessage}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Issue Description *</label>
              <textarea
                name="description"
                placeholder="Explain your issue clearly..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Code Snippet</label>
              <textarea
                name="codeSnippet"
                placeholder="Paste related code snippet here..."
                value={formData.codeSnippet}
                onChange={handleChange}
              ></textarea>
            </div>

            <button
              className="submit-help-btn"
              type="submit"
              disabled={posting}
            >
              <FaGithub />
              {posting ? "Publishing..." : "Publish Public Issue"}
            </button>
          </form>
        </section>

        <section className="help-posts-section">
          <div className="section-title">
            <div>
              <h2>Public Developer Issues</h2>
              <p>
                {loading
                  ? "Loading issues..."
                  : `${filteredPosts.length} issues found`}
              </p>
            </div>
          </div>

          <div className="help-tools">
            <div className="help-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by repo, file, commit, issue..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="help-filter-tabs">
              <button
                className={statusFilter === "All" ? "active" : ""}
                onClick={() => setStatusFilter("All")}
              >
                All
              </button>

              <button
                className={statusFilter === "Open" ? "active" : ""}
                onClick={() => setStatusFilter("Open")}
              >
                Open
              </button>

              <button
                className={statusFilter === "Solved" ? "active" : ""}
                onClick={() => setStatusFilter("Solved")}
              >
                Solved
              </button>
            </div>
          </div>

          <div className="help-posts-list">
            {loading ? (
              <div className="no-help-posts">
                <h3>Loading help posts...</h3>
                <p>Please wait while issues are loaded from MongoDB.</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="help-post-card">
                  <div className="help-post-top">
                    <div>
                      <h3>{post.title}</h3>

                      <div className="help-post-owner">
                        <FaUserCog />
                        Posted by <strong>{post.developerName}</strong>
                        <span>{post.createdAt}</span>
                      </div>

                      <span className="issue-type">{post.issueType}</span>
                    </div>

                    <span
                      className={
                        post.status === "Solved"
                          ? "post-status solved"
                          : "post-status open"
                      }
                    >
                      {post.status}
                    </span>
                  </div>

                  <p className="help-description">{post.description}</p>

                  <div className="issue-meta-box">
                    {post.filePath && (
                      <p>
                        <FaFileCode />
                        File: <strong>{post.filePath}</strong>
                      </p>
                    )}

                    {post.commitId && (
                      <p>
                        <FaCodeBranch />
                        Commit: <strong>{post.commitId}</strong>
                      </p>
                    )}

                    {post.errorMessage && (
                      <p>
                        <FaBug />
                        Error: <strong>{post.errorMessage}</strong>
                      </p>
                    )}
                  </div>

                  {post.codeSnippet && (
                    <div className="code-snippet-box">
                      <h4>Code Snippet</h4>
                      <pre>
                        <code>{post.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {post.repoLink && (
                    <a
                      href={post.repoLink}
                      target="_blank"
                      rel="noreferrer"
                      className="repo-link"
                    >
                      <FaExternalLinkAlt />
                      View Repository
                    </a>
                  )}

                  <div className="help-post-footer">
                    <button
                      className="toggle-replies-btn"
                      onClick={() => toggleReplies(post.id)}
                    >
                      <FaComments />
                      {post.replies.length} Replies
                      {expandedPosts[post.id] ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>

                    {post.status !== "Solved" && (
                      <button onClick={() => markAsSolved(post.id)}>
                        <FaCheckCircle />
                        Mark Solved
                      </button>
                    )}
                  </div>

                  {expandedPosts[post.id] && (
                    <div className="help-replies-section">
                      <h4>Developer Replies</h4>

                      {post.replies.length > 0 ? (
                        <div className="reply-list">
                          {post.replies.map((reply) => (
                            <div key={reply.id} className="reply-card">
                              <div className="reply-header">
                                <span>
                                  <FaUserCog />
                                  {reply.developerName}
                                </span>

                                <small>{reply.createdAt}</small>
                              </div>

                              <p>{reply.message}</p>

                              {reply.codeSnippet && (
                                <div className="code-snippet-box">
                                  <h4>Reply Code Snippet</h4>
                                  <pre>
                                    <code>{reply.codeSnippet}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-replies">
                          No replies yet. Be the first developer to help.
                        </p>
                      )}

                      {post.status !== "Solved" && (
                        <div className="reply-form">
                          <textarea
                            placeholder="Write your solution or suggestion..."
                            value={replyText[post.id] || ""}
                            onChange={(e) =>
                              handleReplyChange(post.id, e.target.value)
                            }
                          ></textarea>

                          <button onClick={() => handleAddReply(post.id)}>
                            <FaReply />
                            Reply with Solution
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-help-posts">
                <h3>No issues found</h3>
                <p>Try another search keyword or filter.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpRoom;