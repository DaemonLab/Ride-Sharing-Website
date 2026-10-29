import axios from "axios";

const backendUrl = "/backend";

/**
 * Same-origin HTTP client. The browser sends HttpOnly session cookies;
 * mutation requests include a CSRF header. JavaScript never reads the session.
 */
const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Handle session expiry without exposing cookie contents to JavaScript.
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const url = error.config?.url ?? "";
    const status = error.response?.status;

    // /auth/status returning 401 is normal when logged out
    if (status === 401 && !url.includes("/auth/status")) {
      window.location.href = "/signin?message=Session+expired,+please+sign+in+again";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
