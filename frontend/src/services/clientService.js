import api from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token || token.startsWith("client_")) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createClientAccess = async (accessData) => {
  const response = await api.post(
    "/api/client/create-access",
    accessData,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const verifyClientAccess = async (clientData) => {
  const response = await api.post("/api/client/access", clientData);
  return response.data;
};

export const getAllClientAccess = async () => {
  const response = await api.get("/api/client/all", {
    headers: getAuthHeaders(),
  });

  return response.data;
};

export const getClientAccessByCode = async (projectCode) => {
  const response = await api.get(
    `/api/client/code/${encodeURIComponent(projectCode)}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};

export const deactivateClientAccess = async (accessId) => {
  const response = await api.put(
    `/api/client/deactivate/${accessId}`,
    {},
    {
      headers: getAuthHeaders(),
    }
  );

  return response.data;
};