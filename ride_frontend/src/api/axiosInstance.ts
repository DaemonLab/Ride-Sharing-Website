import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Cross-origin HTTP client. Authentication is sent as a Better Auth bearer
 * token because the frontend (Vercel) and API (Render) use different origins.
 */
const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bearer_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Clear the bearer token when the backend reports that it is no longer valid.
axiosInstance.interceptors.response.use(
  (response) => {
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
