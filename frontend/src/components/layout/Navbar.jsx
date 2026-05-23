import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FaGithub,
  FaSignInAlt,
  FaSignOutAlt,
  FaComments,
  FaCodeBranch,
  FaHandsHelping,
  FaUserTie,
  FaBell,
  FaLink,
  FaUserShield,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import { getNotifications } from "../../services/notificationService";
import "../../styles/navbar.css";

const Navbar = () => {
  const {
    isAuthenticated,
    isDeveloper,
    isAdmin,
    isClient,
    username,
    clientName,
    logout,
  } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

  const currentUserId =
    localStorage.getItem("userId") ||
    localStorage.getItem("developerId") ||
    localStorage.getItem("clientId");

  const loadUnreadNotifications = async () => {
    if (!isAuthenticated || !currentUserId) return;

    try {
      const data = await getNotifications(currentUserId);

      const unread = Array.isArray(data)
        ? data.filter((item) => item.is_read === false).length
        : 0;

      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notification badge:", error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadUnreadNotifications();
  }, [isAuthenticated, currentUserId]);

  const getUserLabel = () => {
    if (isAdmin) return "Admin";
    if (isDeveloper) return "Developer";
    if (isClient) return "Client";
    return "User";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <div className="logo-icon">
          <FaGithub />
        </div>

        <h1 className="logo-text">GitHub Repo Manager</h1>
      </Link>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>

        {isAuthenticated && (isDeveloper || isAdmin) && (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/view">View</NavLink>
            <NavLink to="/create">Create</NavLink>
          </>
        )}

        {isAuthenticated && isAdmin && (
          <NavLink to="/admin">
            <FaUserShield className="nav-link-icon" />
            Admin
          </NavLink>
        )}

        {isAuthenticated && (isDeveloper || isAdmin || isClient) && (
          <>
            <NavLink to="/commits">
              <FaCodeBranch className="nav-link-icon" />
              Commits
            </NavLink>

            <NavLink to="/chat">
              <FaComments className="nav-link-icon" />
              Chat
            </NavLink>

            <NavLink to="/notifications" className="nav-notification-link">
              <FaBell className="nav-link-icon" />
              Notifications
              {unreadCount > 0 && (
                <span className="nav-notification-badge">{unreadCount}</span>
              )}
            </NavLink>
          </>
        )}

        {isAuthenticated && (isDeveloper || isAdmin) && (
          <>
            <NavLink to="/client-invite">
              <FaLink className="nav-link-icon" />
              Client Invite
            </NavLink>

            <NavLink to="/help-room">
              <FaHandsHelping className="nav-link-icon" />
              Help Room
            </NavLink>
          </>
        )}

        <NavLink to="/future-plans">Future Plans</NavLink>
      </div>

      {isAuthenticated ? (
        <div className="nav-user-actions">
          <span className="nav-user-badge">
            {getUserLabel()}: {username || clientName || "User"}
          </span>

          <button className="login-btn" onClick={logout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      ) : (
        <div className="nav-auth-actions">
          <Link to="/client-access" className="client-access-nav">
            <FaUserTie />
            Client Access
          </Link>

          <Link to="/login" className="login-btn">
            <FaSignInAlt />
            GitHub Access
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;