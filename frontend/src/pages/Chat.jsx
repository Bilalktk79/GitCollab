import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FaUserTie,
  FaUserCog,
  FaCircle,
  FaSearch,
  FaCodeBranch,
  FaGithub,
  FaComments,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";

import ChatBox from "../components/chat/ChatBox";
import {
  getConversation,
  getUserConversations,
  markChatMessageRead,
  sendChatMessage,
} from "../services/chatService";

import "../styles/chat.css";

const Chat = () => {
  const [searchParams] = useSearchParams();

  const initialCommitId = searchParams.get("commit");

  /*
    IMPORTANT FIX:
    Role ke hisaab se user id pick karni hai.
    Agar role client hai to clientId first.
    Agar role developer hai to developerId first.
    Warna old localStorage values mix ho jati hain aur sender_id wrong save hoti hai.
  */
const decodeJwtPayload = (token) => {
  try {
    if (!token) return null;

    const payload = token.split(".")[1];
    if (!payload) return null;

    return JSON.parse(atob(payload));
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

const appToken = localStorage.getItem("token");
const decodedToken = decodeJwtPayload(appToken);

const storedRole =
  decodedToken?.role ||
  localStorage.getItem("user_role") ||
  localStorage.getItem("role") ||
  "developer";

const currentUser = {
  id:
    decodedToken?.user_id ||
    localStorage.getItem("user_id") ||
    localStorage.getItem("clientId") ||
    "",

  name:
    decodedToken?.username ||
    localStorage.getItem("username") ||
    localStorage.getItem("clientName") ||
    "User",

  role: storedRole,
};
  const currentUserRole = currentUser.role;

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const formatDate = (value) => {
    if (!value) return "Just now";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const normalizeConversation = (conversation) => {
    return {
      id: conversation.id,
      title: conversation.title || "Project Discussion",
      type: conversation.type || "repo-support",
      role: conversation.participant_role || "client",
      participantId: String(conversation.participant_id || ""),
      participantName: conversation.participant_name || "User",
      repoId: conversation.repo_id || "",
      repoName: conversation.repo_name || "Repository",
      repoLink: "",
      commitId: conversation.commit_id || "",
      commitMessage: conversation.commit_id
        ? `Discussion for commit ${conversation.commit_id}`
        : "Project discussion",
      lastMessage: conversation.last_message || "No messages yet",
      status: conversation.status || "offline",
      unreadCount: conversation.unread_count || 0,
      priority: conversation.priority || "medium",
      reviewStatus: conversation.review_status || "Pending Review",
      updatedAt: formatDate(conversation.updated_at),
      raw: conversation,
    };
  };

  const normalizeMessage = (message) => {
    return {
      id: message.id,
      chatId: selectedChat,
      senderId: String(message.sender_id || ""),
      receiverId: String(message.receiver_id || ""),
      senderName: message.sender_name || "User",
      senderRole: message.sender_role || "developer",
      text: message.message || "",
      time: formatDate(message.created_at),
      isRead: message.is_read || false,
      commitId: message.commit_id || "",
      raw: message,
    };
  };

  const loadConversations = async () => {
    if (!currentUser.id) {
      console.warn("Current user id missing. Please login again.");
      return;
    }

    try {
      setLoadingConversations(true);

      const data = await getUserConversations(currentUser.id);

      const normalizedData = Array.isArray(data)
  ? data
      .map(normalizeConversation)
      .filter((conversation) => {
        const currentId = String(currentUser.id);

        return (
          String(conversation.participantId) === currentId ||
          conversation.raw?.participants?.map(String).includes(currentId) ||
          currentUser.role === "admin"
        );
      })
  : [];

      setConversations(normalizedData);

      if (normalizedData.length > 0) {
        const commitConversation = initialCommitId
          ? normalizedData.find(
              (conversation) => conversation.commitId === initialCommitId
            )
          : null;

        setSelectedChat(commitConversation?.id || normalizedData[0].id);
      } else {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      alert("Failed to load chat conversations from backend.");
    } finally {
      setLoadingConversations(false);
    }
  };

  const activeConversation = useMemo(() => {
    return conversations.find(
      (conversation) => conversation.id === selectedChat
    );
  }, [conversations, selectedChat]);

  const loadMessages = async () => {
    if (!activeConversation) return;

    try {
      setLoadingMessages(true);

      const data = await getConversation({
        user1Id: currentUser.id,
        user2Id: activeConversation.participantId,
        repoId: activeConversation.repoId,
        commitId: activeConversation.commitId,
      });

      const normalizedMessages = Array.isArray(data)
        ? data.map(normalizeMessage)
        : [];

      setMessages(normalizedMessages);

      const unreadMessages = Array.isArray(data)
        ? data.filter(
            (message) =>
              String(message.receiver_id || "") === String(currentUser.id) &&
              message.is_read === false
          )
        : [];

      await Promise.all(
        unreadMessages.map((message) => markChatMessageRead(message.id))
      );

      if (unreadMessages.length > 0) {
        setConversations((prevConversations) =>
          prevConversations.map((conversation) =>
            conversation.id === activeConversation.id
              ? { ...conversation, unreadCount: 0 }
              : conversation
          )
        );
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      alert("Failed to load messages from backend.");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  const filteredMessages = messages.filter(
    (message) => message.chatId === selectedChat
  );

  const filteredConversations = conversations.filter((conversation) => {
    const search = searchText.toLowerCase();

    const matchesSearch =
      conversation.title.toLowerCase().includes(search) ||
      conversation.repoName.toLowerCase().includes(search) ||
      conversation.commitId.toLowerCase().includes(search) ||
      conversation.commitMessage.toLowerCase().includes(search) ||
      conversation.participantName.toLowerCase().includes(search);

    const matchesFilter =
      selectedFilter === "all" ||
      conversation.role === selectedFilter ||
      (selectedFilter === "unread" && conversation.unreadCount > 0);

    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0
  );

  const handleSelectConversation = (conversationId) => {
    setSelectedChat(conversationId);

    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  };

  const handleSendMessage = async (newMessage) => {
    if (!activeConversation) {
      alert("Please select a conversation first.");
      return;
    }

    const messageText = newMessage?.text?.trim();

    if (!messageText) {
      alert("Message cannot be empty.");
      return;
    }

    if (!currentUser.id) {
      alert("Current user id missing. Please login again.");
      return;
    }

    const payload = {
      sender_id: String(currentUser.id),
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      receiver_id: String(activeConversation.participantId),
      receiver_name: activeConversation.participantName,
      repo_id: activeConversation.repoId || "",
      repo_name: activeConversation.repoName || "",
      commit_id: activeConversation.commitId || "",
      message: messageText,
    };

    try {
      const savedMessage = await sendChatMessage(payload);
      const normalizedMessage = normalizeMessage(savedMessage);

      setMessages((prevMessages) => [...prevMessages, normalizedMessage]);

      setConversations((prevConversations) =>
        prevConversations.map((conversation) =>
          conversation.id === selectedChat
            ? {
                ...conversation,
                lastMessage: normalizedMessage.text,
                updatedAt: "Just now",
              }
            : conversation
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      alert(
        error?.response?.data?.detail ||
          "Failed to send message. Please try again."
      );
    }
  };

  const getReviewStatusIcon = (status) => {
    if (status === "Approved") return <FaCheckCircle />;
    if (status === "Changes Requested") return <FaExclamationCircle />;
    return <FaCodeBranch />;
  };

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <div>
          <h1>
            Commit Linked <span>Chat</span>
          </h1>

          <p>
            Communicate directly with clients and developers regarding commits,
            repository updates, code issues, and requirement changes.
          </p>
        </div>

        <div className="chat-header-summary">
          <div className="summary-card">
            <h3>{conversations.length}</h3>
            <p>Total Chats</p>
          </div>

          <div className="summary-card">
            <h3>{totalUnread}</h3>
            <p>Unread</p>
          </div>
        </div>
      </div>

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <div className="chat-sidebar-top">
            <h3>
              <FaComments />
              Conversations
            </h3>

            <div className="chat-search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search repo, commit, or chat..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="chat-filter-tabs">
              <button
                className={selectedFilter === "all" ? "active" : ""}
                onClick={() => setSelectedFilter("all")}
              >
                All
              </button>

              <button
                className={selectedFilter === "client" ? "active" : ""}
                onClick={() => setSelectedFilter("client")}
              >
                Client
              </button>

              <button
                className={selectedFilter === "developer" ? "active" : ""}
                onClick={() => setSelectedFilter("developer")}
              >
                Developer
              </button>

              <button
                className={selectedFilter === "unread" ? "active" : ""}
                onClick={() => setSelectedFilter("unread")}
              >
                Unread
              </button>
            </div>
          </div>

          <div className="conversation-list">
            {loadingConversations ? (
              <div className="empty-conversation-list">
                <h4>Loading conversations...</h4>
                <p>Please wait.</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={
                    selectedChat === conversation.id
                      ? "conversation-card active"
                      : "conversation-card"
                  }
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="conversation-top">
                    <div className="conversation-avatar">
                      {conversation.role === "client" ? (
                        <FaUserTie />
                      ) : (
                        <FaUserCog />
                      )}
                    </div>

                    <div className="conversation-info">
                      <h4>{conversation.title}</h4>
                      <p>{conversation.repoName}</p>
                    </div>

                    {conversation.unreadCount > 0 && (
                      <span className="unread-badge">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="conversation-commit">
                    <FaCodeBranch />
                    <span>
                      {conversation.commitId || "No specific commit"}
                    </span>
                  </div>

                  <p className="conversation-message">
                    {conversation.lastMessage}
                  </p>

                  <div className="conversation-footer">
                    <span className={`user-status ${conversation.status}`}>
                      <FaCircle />
                      {conversation.status}
                    </span>

                    <span className="conversation-time">
                      {conversation.updatedAt}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="empty-conversation-list">
                <h4>No conversations found</h4>
                <p>
                  Chat will appear here after a client or developer sends a
                  message.
                </p>
              </div>
            )}
          </div>
        </aside>

        <section className="chat-content-area">
          {activeConversation ? (
            <>
              <div className="active-commit-panel">
                <div className="active-commit-left">
                  <div className="active-commit-icon">
                    {getReviewStatusIcon(activeConversation.reviewStatus)}
                  </div>

                  <div>
                    <h3>{activeConversation.commitMessage}</h3>

                    <p>
                      <FaGithub />
                      Repository:{" "}
                      <strong>{activeConversation.repoName}</strong>
                    </p>
                  </div>
                </div>

                <div className="active-commit-right">
                  <span className="commit-id-pill">
                    <FaCodeBranch />
                    {activeConversation.commitId || "No Commit"}
                  </span>

                  <span
                    className={`review-status ${activeConversation.reviewStatus
                      .toLowerCase()
                      .replaceAll(" ", "-")}`}
                  >
                    {activeConversation.reviewStatus}
                  </span>
                </div>
              </div>

              {loadingMessages ? (
                <div className="empty-conversation-list">
                  <h4>Loading messages...</h4>
                  <p>Please wait.</p>
                </div>
              ) : (
                <ChatBox
                  conversation={activeConversation}
                  messages={filteredMessages}
                  currentUserRole={currentUserRole}
                  currentUserId={String(currentUser.id)}
                  onSendMessage={handleSendMessage}
                />
              )}
            </>
          ) : (
            <div className="empty-conversation-list">
              <h4>No chat selected</h4>
              <p>Select a conversation from the sidebar to start chatting.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Chat;