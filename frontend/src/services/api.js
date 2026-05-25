import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const isValidJwtToken = (token) => {
  return (
    token &&
    typeof token === "string" &&
    token.split(".").length === 3
  );
};

api.interceptors.request.use(
  (config) => {
    /*
      Token strategy:

      1. App protected backend routes:
         Use app JWT token from localStorage "token"

      2. GitHub backend proxy routes:
         Use github_token when route starts with /api/github

      3. Public client access:
         /api/client/access should not require JWT

      Important:
      - Admin/developer routes must receive app JWT, not GitHub token.
      - Never send fake client_ token as Bearer JWT.
      - Respect manually supplied Authorization headers.
    */

    const appToken = localStorage.getItem("token");
    const githubToken = localStorage.getItem("github_token");
    const userRole = localStorage.getItem("user_role");

    const url = config.url || "";
    const isGitHubApiRoute = url.startsWith("/api/github");
    const isPublicClientAccessRoute = url === "/api/client/access";

    if (config.headers?.Authorization) {
      return config;
    }

    if (isPublicClientAccessRoute) {
      return config;
    }

    if (isGitHubApiRoute && githubToken) {
      config.headers.Authorization = `Bearer ${githubToken}`;
    } else if (isValidJwtToken(appToken)) {
      config.headers.Authorization = `Bearer ${appToken}`;
    }

    if (userRole) {
      config.headers["X-User-Role"] = userRole;
    }

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