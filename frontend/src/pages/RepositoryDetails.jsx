import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

import "../styles/pages.css";

const RepositoryDetails = () => {

  const { owner, repoName } = useParams();

  const [repo, setRepo] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchRepoDetails = async () => {

      try {

        const response = await api.get(
          `/api/github/repos`
        );

        const repos = response.data || [];

        const foundRepo = repos.find(
          (r) =>
            r.name === repoName &&
            r.owner?.login === owner
        );

        setRepo(foundRepo);

      } catch (error) {

        console.error(
          "Failed to fetch repo details",
          error
        );

      } finally {

        setLoading(false);

      }
    };

    fetchRepoDetails();

  }, [owner, repoName]);

  if (loading) {
    return (
      <div className="page">
        <h2>Loading repository...</h2>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="page">
        <h2>Repository not found.</h2>
      </div>
    );
  }

  return (
    <div className="page">

      <h1 className="page-title">
        Repository Details
      </h1>

      <div className="underline"></div>

      <div className="repo-card">

        <h2>{repo.name}</h2>

        <p>
          {repo.description ||
            "No description available"}
        </p>

        <p>
          <strong>Owner:</strong>{" "}
          {repo.owner?.login}
        </p>

        <p>
          <strong>Visibility:</strong>{" "}
          {repo.private
            ? "Private"
            : "Public"}
        </p>

        <p>
          <strong>Default Branch:</strong>{" "}
          {repo.default_branch}
        </p>

        <p>
          <strong>Stars:</strong>{" "}
          {repo.stargazers_count}
        </p>

        <p>
          <strong>Forks:</strong>{" "}
          {repo.forks_count}
        </p>

        <div className="repo-actions">

          <a
            className="primary-btn"
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
          >
            Open on GitHub
          </a>

        </div>

      </div>

    </div>
  );
};

export default RepositoryDetails;