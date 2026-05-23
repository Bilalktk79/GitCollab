import { Link } from "react-router-dom";
import "../../styles/repo.css";

const RepoCard = ({ repo }) => {
  const owner = repo?.owner?.login || localStorage.getItem("username");

  return (
    <div className="repo-card">
      <h3>{repo?.name}</h3>
      <p>{repo?.description || "No description available"}</p>
      <p>Visibility: {repo?.private ? "Private" : "Public"}</p>

      <div className="repo-actions">
        <Link className="primary-btn" to={`/repositories/${owner}/${repo?.name}`}>
          Details
        </Link>

        {repo?.html_url && (
          <a className="secondary-btn" href={repo.html_url} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
      </div>
    </div>
  );
};

export default RepoCard;