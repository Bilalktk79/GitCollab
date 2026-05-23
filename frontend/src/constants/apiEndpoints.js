export const API_BASE_URL = "http://127.0.0.1:8000/api";

export const AUTH_ENDPOINTS = {
  githubLogin: `${API_BASE_URL}/auth/github/login`,
  githubTokenLogin: `${API_BASE_URL}/auth/github/token-login`,
  login: `${API_BASE_URL}/auth/login`,
  signup: `${API_BASE_URL}/auth/signup`,
};

export const GITHUB_ENDPOINTS = {
  repos: `${API_BASE_URL}/github/repos`,
  createRepo: `${API_BASE_URL}/github/repos/create`,
};