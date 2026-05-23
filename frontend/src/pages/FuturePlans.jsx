import "../styles/pages.css";

const FuturePlans = () => {
  return (
    <div className="page">
      <h1 className="page-title">Future Plans</h1>
      <div className="underline"></div>

      <div className="repo-grid">
        <div className="repo-card">
          <h3>GitHub OAuth Full Sync</h3>
          <p>Show live profile, repositories, commits and collaborators.</p>
        </div>

        <div className="repo-card">
          <h3>AI Repository Summary</h3>
          <p>Generate smart summaries of repositories and commits.</p>
        </div>

        <div className="repo-card">
          <h3>Advanced Dashboard</h3>
          <p>Graphs, analytics, stars, forks and contribution stats.</p>
        </div>
      </div>
    </div>
  );
};

export default FuturePlans;