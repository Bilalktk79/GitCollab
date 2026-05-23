import api from "./api";

export const createCommitReview = async (commitData) => {
  const response = await api.post("/api/commits/create", commitData);
  return response.data;
};

export const getAllCommitReviews = async () => {
  const response = await api.get("/api/commits/all");
  return response.data;
};

export const getCommitReviewByCommitId = async (commitId) => {
  const response = await api.get(`/api/commits/${commitId}`);
  return response.data;
};

export const updateCommitReviewStatus = async (commitId, reviewData) => {
  const response = await api.put(`/api/commits/${commitId}/status`, reviewData);
  return response.data;
};

export const deleteCommitReview = async (commitId) => {
  const response = await api.delete(`/api/commits/${commitId}`);
  return response.data;
};