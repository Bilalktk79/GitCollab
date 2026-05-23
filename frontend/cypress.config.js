import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    env: {
      API_BASE_URL: "http://127.0.0.1:8000",
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});