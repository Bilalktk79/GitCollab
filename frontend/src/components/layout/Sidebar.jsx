import { NavLink } from "react-router-dom";
import { FaHome, FaGithub, FaPlus, FaEye, FaUser, FaCog } from "react-icons/fa";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">GitHub Manager</h2>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard"><FaHome /> Dashboard</NavLink>
        <NavLink to="/repositories"><FaGithub /> Repositories</NavLink>
        <NavLink to="/create"><FaPlus /> Create Repo</NavLink>
        <NavLink to="/view"><FaEye /> View</NavLink>
        <NavLink to="/profile"><FaUser /> Profile</NavLink>
        <NavLink to="/settings"><FaCog /> Settings</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;