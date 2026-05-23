import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    /*
      Token strategy:

      1. Admin/app protected backend routes:
         Use app token from localStorage "token"

      2. GitHub related backend routes:
         Use github_token when route is /api/github/...

      3. Client routes:
         Use client/app token from "token"

      Important:
      Admin routes must NOT receive GitHub token.
      They need app JWT token because backend decodes role/user_id from it.
    */

    const appToken = localStorage.getItem("token");
    const githubToken = localStorage.getItem("github_token");
    const userRole = localStorage.getItem("user_role");

    const url = config.url || "";
    const isGitHubApiRoute = url.startsWith("/api/github");

    if (isGitHubApiRoute && githubToken) {
      config.headers.Authorization = `Bearer ${githubToken}`;
    } else if (appToken) {
      config.headers.Authorization = `Bearer ${appToken}`;
    }

    config.headers["X-User-Role"] = userRole || "";

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
    );

    return Promise.reject(error);
  }
);

export default api;