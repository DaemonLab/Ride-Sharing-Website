import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Shared Axios instance configured for Token-Based (Bearer) authentication.
 * - baseURL is read from the VITE_BACKEND_URL env variable
 * - Automatically attaches Authorization: Bearer <token> from localStorage
 * - Intercepts responses to capture updated tokens and handle session expiration
 */
const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token to all outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bearer_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: capture refreshed tokens and handle 401 uniformly
axiosInstance.interceptors.response.use(
  (response) => {
    const authToken = response.headers["set-auth-token"];
    if (authToken) {
      localStorage.setItem("bearer_token", authToken);
    }
    return response;
  },
  (error) => {
    const url = error.config?.url ?? "";
    const status = error.response?.status;

    // /auth/status returning 401 is normal when logged out
    if (status === 401 && !url.includes("/auth/status")) {
      localStorage.removeItem("bearer_token");
      window.location.href = "/signin?message=Session+expired,+please+sign+in+again";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
