import api from "./api";

export const getAdminDashboard = async () => {
  const res = await api.get("/api/admin/dashboard");
  return res.data;
};

export const getAdminUsers = async () => {
  const res = await api.get("/api/admin/users");
  return res.data;
};

export const getAdminRepositories = async () => {
  const res = await api.get("/api/admin/repositories");
  return res.data;
};

export const getAdminCommits = async () => {
  const res = await api.get("/api/admin/commits");
  return res.data;
};

export const getAdminClients = async () => {
  const res = await api.get("/api/admin/clients");
  return res.data;
};

export const getAdminHelpPosts = async () => {
  const res = await api.get("/api/admin/help-posts");
  return res.data;
};

export const getAdminNotifications = async () => {
  const res = await api.get("/api/admin/notifications");
  return res.data;
};

export const getAdminLogs = async () => {
  const res = await api.get("/api/admin/logs");
  return res.data;
};


// ======================================================
// Admin Action APIs
// ======================================================

export const blockAdminUser = async (userId) => {
  const res = await api.put(`/api/admin/users/${userId}/block`);
  return res.data;
};

export const unblockAdminUser = async (userId) => {
  const res = await api.put(`/api/admin/users/${userId}/unblock`);
  return res.data;
};

export const revokeAdminClientAccess = async (clientId) => {
  const res = await api.put(`/api/admin/clients/${clientId}/revoke`);
  return res.data;
};

export const activateAdminClientAccess = async (clientId) => {
  const res = await api.put(`/api/admin/clients/${clientId}/activate`);
  return res.data;
};

export const markAdminHelpPostSolved = async (postId) => {
  const res = await api.put(`/api/admin/help-posts/${postId}/solve`);
  return res.data;
};

export const updateAdminCommitStatus = async (commitId, status) => {
  const res = await api.put(`/api/admin/commits/${commitId}/status`, {
    status,
  });

  return res.data;
};