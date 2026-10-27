// Keep production API and session cookies on the frontend origin.
// This avoids mobile browsers blocking cross-site session cookies.
export const API_BASE_URL = import.meta.env.PROD
  ? "/api"
  : (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000");
