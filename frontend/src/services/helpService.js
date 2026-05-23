import api from "./api";

export const createHelpPost = async (postData) => {
  const response = await api.post("/api/help/create", postData);
  return response.data;
};

export const getHelpPosts = async () => {
  const response = await api.get("/api/help/all");
  return response.data;
};

export const getHelpPostDetails = async (postId) => {
  const response = await api.get(`/api/help/${postId}`);
  return response.data;
};

export const replyToHelpPost = async (postId, replyData) => {
  const response = await api.post(`/api/help/${postId}/reply`, replyData);
  return response.data;
};

export const markHelpPostSolved = async (postId) => {
  const response = await api.put(`/api/help/${postId}/solve`);
  return response.data;
};