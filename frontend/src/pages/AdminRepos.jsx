import { useEffect, useState } from "react";
import { FaGithub, FaLock, FaUnlock } from "react-icons/fa";
import { getAdminRepositories } from "../services/adminService";

import "../styles/pages.css";
import "../styles/admin.css";

const AdminRepos = () => {
  const [repos, setRepos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchRepos = async () => {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAdminRepositories();
      setRepos(data.repositories || []);
    } catch (error) {
      console.error("Admin repositories error:", error);
      setMessage(error?.response?.data?.detail || "Failed to load repositories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const filteredRepos = repos.filter((repo) => {
    const text = `${repo.name || ""} ${repo.repo_name || ""} ${repo.owner || ""} ${repo.language || ""}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page">
      <h1 className="page-title">
        Admin <span className="orange">Repositories</span>
      </h1>
      <div className="underline"></div>

      <div className="admin-hero-card">
        <div>
          <h2>
            <FaGithub /> Repository Monitoring
          </h2>
          <p>View repositories stored in the system and monitor project activity.</p>
        </div>

        <button className="admin-refresh-btn" onClick={fetchRepos}>
          Refresh
        </button>
      </div>

      <input
        className="admin-search-input"
        type="text"
        placeholder="Search repositories by name, owner or language..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {message && <p className="admin-error-message">{message}</p>}

      {loading ? (
        <p className="admin-empty-text">Loading repositories...</p>
      ) : filteredRepos.length === 0 ? (
        <p className="admin-empty-text">No repositories found.</p>
      ) : (
        <div className="admin-section-grid">
          {filteredRepos.map((repo) => (
            <div className="admin-section-card" key={repo.id || repo.repo_id}>
              <h2>{repo.repo_name || repo.name || "Unnamed Repo"}</h2>
              <p className="admin-muted-text">
                Owner: {repo.owner || repo.owner_name || repo.developer_name || "N/A"}
              </p>
              <p className="admin-muted-text">
                Language: {repo.language || "N/A"}
              </p>
              <p className="admin-muted-text">
                Visibility:{" "}
                {repo.private ? (
                  <span className="admin-danger-text">
                    <FaLock /> Private
                  </span>
                ) : (
                  <span className="admin-success-text">
                    <FaUnlock /> Public
                  </span>
                )}
              </p>
              <p className="admin-muted-text">
                Created: {repo.created_at ? new Date(repo.created_at).toLocaleString() : "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRepos;