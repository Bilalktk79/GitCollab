import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useRepo } from "../context/repoContext";
import {
  getStarredRepos,
  deleteRepo,
  updateRepo,
} from "../services/repoService";

import "../styles/pages.css";
import "../styles/repo.css";

const View = ({ manageMode = false }) => {
  const { repos, loading, fetchRepos } = useRepo();

  const [starredRepos, setStarredRepos] = useState([]);
  const [starredLoading, setStarredLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("default");

  const [editingRepo, setEditingRepo] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    visibility: "public",
  });

  const location = useLocation();
  const isStarredPage = location.pathname === "/starred";

  const loadedPageRef = useRef("");

  useEffect(() => {
    const pageKey = isStarredPage ? "starred" : "repos";

    if (loadedPageRef.current === pageKey) return;

    loadedPageRef.current = pageKey;

    const loadRepos = async () => {
      if (isStarredPage) {
        try {
          setStarredLoading(true);

          const starredData = await getStarredRepos();

          setStarredRepos(Array.isArray(starredData) ? starredData : []);
        } catch (error) {
          console.error("Failed to fetch starred repos:", error);
          setStarredRepos([]);
        } finally {
          setStarredLoading(false);
        }
      } else {
        await fetchRepos();
      }
    };

    loadRepos();
  }, [isStarredPage]);

  const displayRepos = useMemo(() => {
    const data = isStarredPage ? starredRepos : repos;
    return Array.isArray(data) ? data : [];
  }, [isStarredPage, starredRepos, repos]);

  const isLoading = isStarredPage ? starredLoading : loading;

  const languages = useMemo(() => {
    const langs = displayRepos
      .map((repo) => repo?.language)
      .filter((language) => language && language.trim() !== "");

    return ["all", ...new Set(langs)];
  }, [displayRepos]);

  const filteredRepos = useMemo(() => {
    let result = [...displayRepos];

    if (search.trim() !== "") {
      result = result.filter((repo) =>
        repo?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (visibilityFilter === "public") {
      result = result.filter((repo) => repo?.private === false);
    }

    if (visibilityFilter === "private") {
      result = result.filter((repo) => repo?.private === true);
    }

    if (languageFilter !== "all") {
      result = result.filter((repo) => repo?.language === languageFilter);
    }

    if (sortFilter === "recent") {
      result.sort(
        (a, b) =>
          new Date(b?.updated_at || 0) - new Date(a?.updated_at || 0)
      );
    }

    if (sortFilter === "name") {
      result.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
    }

    return result;
  }, [displayRepos, search, visibilityFilter, languageFilter, sortFilter]);

  const refreshRepos = async () => {
    loadedPageRef.current = "";

    if (isStarredPage) {
      try {
        setStarredLoading(true);
        const starredData = await getStarredRepos();
        setStarredRepos(Array.isArray(starredData) ? starredData : []);
      } catch (error) {
        console.error("Failed to refresh starred repos:", error);
        setStarredRepos([]);
      } finally {
        setStarredLoading(false);
      }
    } else {
      await fetchRepos();
    }
  };

  const handleDeleteRepo = async (owner, repoName) => {
    if (!owner || !repoName) {
      alert("Repository owner or name missing");
      return;
    }

    const confirmDelete = window.confirm(`Delete repository "${repoName}" ?`);

    if (!confirmDelete) return;

    try {
      await deleteRepo(owner, repoName);

      alert("Repository deleted successfully");

      await refreshRepos();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.detail ||
          "Failed to delete repository"
      );
    }
  };

  const openEditModal = (repo) => {
    setEditingRepo(repo);

    setEditForm({
      name: repo?.name || "",
      description: repo?.description || "",
      visibility: repo?.private ? "private" : "public",
    });
  };

  const closeEditModal = () => {
    setEditingRepo(null);

    setEditForm({
      name: "",
      description: "",
      visibility: "public",
    });
  };

  const handleUpdateRepo = async (e) => {
    e.preventDefault();

    if (!editingRepo) return;

    const owner = editingRepo?.owner?.login;

    if (!owner) {
      alert("Owner missing");
      return;
    }

    const payload = {
      name: editForm.name,
      description: editForm.description,
      private: editForm.visibility === "private",
    };

    try {
      await updateRepo(owner, editingRepo.name, payload);

      alert("Repository updated successfully");

      closeEditModal();

      await refreshRepos();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.detail ||
          "Failed to update repository"
      );
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">
        {isStarredPage
          ? "Starred Repositories"
          : manageMode
          ? "Manage Repositories"
          : "Repositories"}
      </h1>

      <div className="underline"></div>

      {!isLoading && displayRepos.length > 0 && (
        <div className="repo-toolbar">
          <input
            type="text"
            placeholder="Search repositories by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="repo-search"
          />

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="repo-filter"
          >
            <option value="all">All Repos</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="repo-filter"
          >
            {languages.map((language) => (
              <option key={language} value={language}>
                {language === "all" ? "All Languages" : language}
              </option>
            ))}
          </select>

          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
            className="repo-filter"
          >
            <option value="default">Default</option>
            <option value="recent">Recently Updated</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      )}

      {isLoading ? (
        <h2 className="repo-empty">Loading repositories...</h2>
      ) : (
        <div className="repo-grid">
          {filteredRepos.length > 0 ? (
            filteredRepos.map((repo, index) => (
              <div className="repo-card" key={repo?.id || index}>
                <h3>{repo?.name}</h3>

                <p>{repo?.description || "No description available"}</p>

                <p>
                  <span className="repo-label">Visibility:</span>{" "}
                  {repo?.private ? "Private" : "Public"}
                </p>

                {repo?.language && (
                  <p>
                    <span className="repo-label">Language:</span>{" "}
                    {repo.language}
                  </p>
                )}

                <div className="repo-actions">
                  <Link
                    className="primary-btn"
                    to={`/repositories/${repo?.owner?.login}/${repo?.name}`}
                  >
                    View Details
                  </Link>

                  {manageMode && !isStarredPage ? (
                    <button
                      className="primary-btn"
                      type="button"
                      onClick={() => openEditModal(repo)}
                    >
                      Edit
                    </button>
                  ) : (
                    repo?.html_url && (
                      <a
                        className="primary-btn"
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        GitHub
                      </a>
                    )
                  )}

                  {manageMode && !isStarredPage && (
                    <button
                      className="primary-btn delete-btn"
                      type="button"
                      onClick={() =>
                        handleDeleteRepo(repo?.owner?.login, repo?.name)
                      }
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <h2 className="repo-empty">No repositories found.</h2>
          )}
        </div>
      )}

      {editingRepo && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h2>Edit Repository</h2>

            <form onSubmit={handleUpdateRepo}>
              <label>Repository Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <label>Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    description: e.target.value,
                  })
                }
                rows="4"
              ></textarea>

              <label>Visibility</label>
              <select
                value={editForm.visibility}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    visibility: e.target.value,
                  })
                }
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>

              <div className="modal-actions">
                <button type="button" onClick={closeEditModal}>
                  Cancel
                </button>

                <button type="submit" className="primary-btn">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default View;