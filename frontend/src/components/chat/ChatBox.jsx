import { useState } from "react";
import {
  FaPaperPlane,
  FaCodeBranch,
  FaGithub,
  FaUserTie,
  FaUserCog,
} from "react-icons/fa";
import ChatMessage from "./ChatMessage";

const ChatBox = ({
  conversation,
  messages = [],
  currentUserRole = "developer",
  currentUserId = "",
  onSendMessage,
}) => {
  const [messageText, setMessageText] = useState("");

  const conversationRole = conversation?.role?.toLowerCase();
  const userRole = currentUserRole?.toLowerCase();

  const currentUserName =
    userRole === "client"
      ? localStorage.getItem("clientName") ||
        localStorage.getItem("username") ||
        "Client"
      : localStorage.getItem("developerName") ||
        localStorage.getItem("username") ||
        "Developer";

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalText = messageText.trim();

    if (!finalText) return;

    if (!currentUserId) {
      alert("Current user id missing. Please login again.");
      return;
    }

    const newMessage = {
      id: Date.now(),
      chatId: conversation?.id,
      senderId: String(currentUserId),
      senderName: currentUserName,
      senderRole: userRole,
      text: finalText,
      time: "Just now",
      isRead: false,
      commitId: conversation?.commitId || "",
    };

    if (onSendMessage) {
      onSendMessage(newMessage);
    }

    setMessageText("");
  };

  if (!conversation) {
    return (
      <div className="chat-box empty-chat-box">
        <h2>No Conversation Selected</h2>
        <p>
          Select a conversation to start discussing commits and repository
          issues.
        </p>
      </div>
    );
  }

  return (
    <div className="chat-box">
      <div className="chat-box-header">
        <div className="chat-user-info">
          <div className="chat-user-icon">
            {conversationRole === "client" ? <FaUserTie /> : <FaUserCog />}
          </div>

          <div>
            <h2>{conversation.title}</h2>
            <p>
              {conversationRole === "client"
                ? "Client Review Discussion"
                : "Developer Support Discussion"}
            </p>
          </div>
        </div>

        <div className="chat-repo-info">
          <span>
            <FaGithub />
            {conversation.repoName || "No Repository"}
          </span>

          {conversation.commitId && (
            <span>
              <FaCodeBranch />
              {conversation.commitId}
            </span>
          )}
        </div>
      </div>

      <div className="chat-box-body">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              currentUserId={String(currentUserId)}
            />
          ))
        ) : (
          <div className="no-messages">
            <h3>No messages yet</h3>
            <p>Start a conversation about this commit or repository issue.</p>
          </div>
        )}
      </div>

      <form className="chat-box-footer" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Write your message about this commit or repository..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />

        <button type="submit">
          <FaPaperPlane />
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;