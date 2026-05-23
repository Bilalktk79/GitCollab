import api from "./api";

export const createClientAccess = async (accessData) => {
  const response = await api.post("/api/client/create-access", accessData);
  return response.data;
};

export const verifyClientAccess = async (clientData) => {
  const response = await api.post("/api/client/access", clientData);
  return response.data;
};

export const getAllClientAccess = async () => {
  const response = await api.get("/api/client/all");
  return response.data;
};

export const getClientAccessByCode = async (projectCode) => {
  const response = await api.get(`/api/client/code/${projectCode}`);
  return response.data;
};

export const deactivateClientAccess = async (accessId) => {
  const response = await api.put(`/api/client/deactivate/${accessId}`);
  return response.data;
};