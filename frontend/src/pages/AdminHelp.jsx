import { useEffect, useState } from "react";
import {
  FaHandsHelping,
  FaBug,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getAdminHelpPosts,
  markAdminHelpPostSolved,
} from "../services/adminService";

import "../styles/pages.css";
import "../styles/admin.css";

const AdminHelp = () => {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");

  const fetchHelpPosts = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAdminHelpPosts();
      setPosts(data.help_posts || []);
    } catch (error) {
      console.error("Admin help posts error:", error);
      setMessage(error?.response?.data?.detail || "Failed to load help posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpPosts();
  }, []);

  const handleMarkSolved = async (postId) => {
    try {
      setActionLoading(postId);
      setMessage("");

      await markAdminHelpPostSolved(postId);

      setMessage("Help post marked as solved successfully.");
      await fetchHelpPosts();
    } catch (error) {
      console.error("Mark help post solved error:", error);
      setMessage(
        error?.response?.data?.detail || "Failed to mark help post as solved."
      );
    } finally {
      setActionLoading("");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesFilter = filter === "All" || post.status === filter;

    const text = `${post.title || ""} ${post.issue_type || ""} ${
      post.developer_name || ""
    } ${post.description || ""}`;

    const matchesSearch = text.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page">
      <h1 className="page-title">
        Admin <span className="orange">Help Room</span>
      </h1>
      <div className="underline"></div>

      <div className="admin-hero-card">
        <div>
          <h2>
            <FaHandsHelping /> Help Room Monitoring
          </h2>
          <p>
            View developer help posts, issue types, repository links and solved
            status.
          </p>
        </div>

        <button className="admin-refresh-btn" onClick={fetchHelpPosts}>
          Refresh
        </button>
      </div>

      <div className="admin-filter-row">
        {["All", "Open", "Solved"].map((item) => (
          <button
            key={item}
            className={
              filter === item ? "admin-filter-btn active" : "admin-filter-btn"
            }
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <input
        className="admin-search-input"
        type="text"
        placeholder="Search help posts by title, issue type, developer or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {message && <p className="admin-error-message">{message}</p>}

      {loading ? (
        <p className="admin-empty-text">Loading help posts...</p>
      ) : filteredPosts.length === 0 ? (
        <p className="admin-empty-text">No help posts found.</p>
      ) : (
        <div className="admin-section-grid">
          {filteredPosts.map((post) => {
            const postId = post.id;
            const isSolved = post.status === "Solved";
            const isCurrentActionLoading = actionLoading === postId;

            return (
              <div className="admin-section-card" key={post.id}>
                <h2>
                  <FaBug /> {post.title || "Untitled Issue"}
                </h2>

                <p className="admin-muted-text">
                  Developer: {post.developer_name || "N/A"}
                </p>

                <p className="admin-muted-text">
                  Issue Type: {post.issue_type || "General"}
                </p>

                <p className="admin-muted-text">
                  {post.description || "No description"}
                </p>

                {post.repo_link && (
                  <a
                    className="admin-link-text"
                    href={post.repo_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Repository
                  </a>
                )}

                <br />

                <span
                  className={
                    isSolved
                      ? "admin-status approved"
                      : "admin-status pending"
                  }
                >
                  <FaCheckCircle /> {post.status || "Open"}
                </span>

                {!isSolved && (
                  <div className="admin-card-actions">
                    <button
                      className="admin-action-btn admin-action-success"
                      disabled={isCurrentActionLoading || !postId}
                      onClick={() => handleMarkSolved(postId)}
                    >
                      <FaCheckCircle />{" "}
                      {isCurrentActionLoading ? "Working..." : "Mark Solved"}
                    </button>
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

export default AdminHelp;