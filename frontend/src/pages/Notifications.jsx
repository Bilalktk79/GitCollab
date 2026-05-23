import { useEffect, useState } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaComments,
  FaHandsHelping,
  FaCodeBranch,
  FaExternalLinkAlt,
  FaClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
  getNotifications,
  markNotificationRead,
} from "../services/notificationService";

import "../styles/notifications.css";

const Notifications = () => {
  const navigate = useNavigate();

  const currentUser = {
    id:
      localStorage.getItem("userId") ||
      localStorage.getItem("developerId") ||
      localStorage.getItem("clientId") ||
      "101",
    role:
      localStorage.getItem("userRole") ||
      localStorage.getItem("role") ||
      "developer",
  };

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const formatDate = (value) => {
    if (!value) return "Just now";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const normalizeNotification = (item) => {
    return {
      id: item.id,
      userId: item.user_id || "",
      title: item.title || "Notification",
      message: item.message || "",
      type: item.type || "general",
      relatedId: item.related_id || "",
      isRead: item.is_read || false,
      createdAt: formatDate(item.created_at),
    };
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const data = await getNotifications(currentUser.id);

      const normalizedData = Array.isArray(data)
        ? data.map(normalizeNotification)
        : [];

      setNotifications(normalizedData);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      alert("Failed to load notifications from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId) => {
    try {
      const updatedNotification = await markNotificationRead(notificationId);
      const normalizedNotification = normalizeNotification(updatedNotification);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId ? normalizedNotification : item
        )
      );
    } catch (error) {
      console.error("Failed to mark notification read:", error);
      alert(
        error?.response?.data?.detail ||
          "Failed to mark notification as read."
      );
    }
  };

  const handleOpenRelated = async (notification) => {
    if (!notification.isRead) {
      await handleMarkRead(notification.id);
    }

    if (notification.type === "chat") {
      navigate("/chat");
      return;
    }

    if (notification.type === "help_reply") {
      navigate("/help-room");
      return;
    }

    if (notification.type === "commit_review") {
      if (notification.relatedId) {
        navigate(`/commits/${notification.relatedId}`);
      } else {
        navigate("/commits");
      }
      return;
    }

    navigate("/");
  };

  const getNotificationIcon = (type) => {
    if (type === "chat") return <FaComments />;
    if (type === "help_reply") return <FaHandsHelping />;
    if (type === "commit_review") return <FaCodeBranch />;
    return <FaBell />;
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "all") return true;
    if (filter === "unread") return !item.isRead;
    if (filter === "read") return item.isRead;
    return item.type === filter;
  });

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>
            Notifications <span>Center</span>
          </h1>

          <p>
            Track chat messages, help room replies, and commit review updates.
          </p>
        </div>

        <div className="notifications-summary">
          <div className="notification-summary-card">
            <h3>{notifications.length}</h3>
            <p>Total</p>
          </div>

          <div className="notification-summary-card">
            <h3>{unreadCount}</h3>
            <p>Unread</p>
          </div>
        </div>
      </div>

      <div className="notification-filter-bar">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "unread" ? "active" : ""}
          onClick={() => setFilter("unread")}
        >
          Unread
        </button>

        <button
          className={filter === "read" ? "active" : ""}
          onClick={() => setFilter("read")}
        >
          Read
        </button>

        <button
          className={filter === "chat" ? "active" : ""}
          onClick={() => setFilter("chat")}
        >
          Chat
        </button>

        <button
          className={filter === "help_reply" ? "active" : ""}
          onClick={() => setFilter("help_reply")}
        >
          Help Room
        </button>

        <button
          className={filter === "commit_review" ? "active" : ""}
          onClick={() => setFilter("commit_review")}
        >
          Commit Review
        </button>
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="empty-notifications">
            <h3>Loading notifications...</h3>
            <p>Please wait while notifications are loaded.</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={
                notification.isRead
                  ? "notification-card read"
                  : "notification-card unread"
              }
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-top">
                  <h3>{notification.title}</h3>

                  <span className={notification.isRead ? "read-pill" : "unread-pill"}>
                    {notification.isRead ? "Read" : "Unread"}
                  </span>
                </div>

                <p>{notification.message}</p>

                <div className="notification-meta">
                  <span>
                    <FaClock />
                    {notification.createdAt}
                  </span>

                  <span>Type: {notification.type}</span>
                </div>

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button onClick={() => handleMarkRead(notification.id)}>
                      <FaCheckCircle />
                      Mark Read
                    </button>
                  )}

                  <button onClick={() => handleOpenRelated(notification)}>
                    <FaExternalLinkAlt />
                    Open Related
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-notifications">
            <h3>No notifications found</h3>
            <p>No notifications match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;