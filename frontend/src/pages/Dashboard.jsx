import { Link } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaStar,
  FaTrash,
  FaGithub,
  FaUpload,
} from "react-icons/fa";
import "../styles/pages.css";

const Dashboard = () => {
  return (
    <div className="page">
      <h1 className="page-title">Developer Dashboard</h1>
      <div className="underline"></div>

      <div className="dashboard-grid">
        <Link to="/create" className="dash-card">
          <FaPlus />
          <h3>Create New Repository</h3>
        </Link>

        <Link to="/view" className="dash-card">
          <FaEye />
          <h3>View Repositories</h3>
        </Link>

        <Link to="/starred" className="dash-card">
          <FaStar />
          <h3>Starred Repositories</h3>
        </Link>

        <Link to="/manage" className="dash-card">
         <FaTrash />
           <h3>Manage Repositories</h3>
        </Link>

        <Link to="/upload" className="dash-card">
          <FaUpload />
          <h3>Upload File</h3>
        </Link>

        <Link to="/login" className="dash-card">
          <FaGithub />
          <h3>GitHub Auth</h3>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;