import api from "./api";

export const createNotification = async (notificationData) => {
  const response = await api.post("/api/notifications/create", notificationData);
  return response.data;
};

export const getNotifications = async (userId) => {
  const response = await api.get(`/api/notifications/${userId}`);
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await api.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};