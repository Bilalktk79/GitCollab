import api from "./api";

export const githubTokenLogin = async (token) => {
  try {
    const response = await api.post("/api/auth/github/token-login", {
      token,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};