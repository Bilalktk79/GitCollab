import api from "./api";

export const sendChatMessage = async (messageData) => {
  const response = await api.post("/api/chat/send", messageData);
  return response.data;
};

export const getConversation = async ({
  user1Id,
  user2Id,
  repoId,
  commitId,
}) => {
  const response = await api.get("/api/chat/conversation", {
    params: {
      user1_id: user1Id,
      user2_id: user2Id,
      repo_id: repoId || "",
      commit_id: commitId || "",
    },
  });

  return response.data;
};

export const getCommitChat = async (commitId) => {
  const response = await api.get(`/api/chat/commit/${commitId}`);
  return response.data;
};

export const getUserConversations = async (userId) => {
  const response = await api.get(`/api/chat/conversations/${userId}`);
  return response.data;
};

export const markChatMessageRead = async (messageId) => {
  const response = await api.put(`/api/chat/read/${messageId}`);
  return response.data;
};