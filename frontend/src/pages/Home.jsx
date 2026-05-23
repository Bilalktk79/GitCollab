import { Link } from "react-router-dom";
import { FaGithub, FaUserTie } from "react-icons/fa";
import "../styles/pages.css";

const Home = () => {
  return (
    <div className="page">
      <div className="hero">
        <div>
          <h1>Simplify Your GitHub Workflow</h1>

          <p>
            Manage repositories like a pro — create, delete, view commits,
            upload files and manage collaborators from one dashboard.
          </p>

          <div className="hero-actions">
            <Link to="/dashboard" className="primary-btn">
              <FaGithub />
              Launch Developer Dashboard
            </Link>

            <Link to="/client-access" className="secondary-btn">
              <FaUserTie />
              Client Access
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <FaGithub />
        </div>
      </div>
    </div>
  );
};

export default Home;