import {
  FaUserTie,
  FaUserCog,
  FaCodeBranch,
  FaCheckDouble,
} from "react-icons/fa";

const ChatMessage = ({ message, currentUserId = "" }) => {
  const senderId = String(message.senderId || message.raw?.sender_id || "");
  const loggedInUserId = String(currentUserId || "");

  const isOwnMessage =
    senderId !== "" &&
    loggedInUserId !== "" &&
    senderId === loggedInUserId;

  const senderRole = message.senderRole?.toLowerCase() || "developer";

  return (
    <div className={isOwnMessage ? "chat-message-row own" : "chat-message-row"}>
      <div className="chat-message-avatar">
        {senderRole === "client" ? <FaUserTie /> : <FaUserCog />}
      </div>

      <div className="chat-message-content">
        <div className="chat-message-meta">
          <strong>{message.senderName}</strong>
          <span>{message.time}</span>
        </div>

        {message.commitId && (
          <div className="chat-commit-reference">
            <FaCodeBranch />
            <span>Commit: {message.commitId}</span>
          </div>
        )}

        <div
          className={
            isOwnMessage ? "chat-message-bubble own" : "chat-message-bubble"
          }
        >
          <p>{message.text}</p>
        </div>

        {isOwnMessage && (
          <div className="message-seen-status">
            <FaCheckDouble />
            <span>{message.isRead ? "Seen" : "Sent"}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;