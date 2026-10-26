import { createAuthClient } from "better-auth/client";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Better Auth client for token-based authentication.
 * Configured per Better Auth v1.7 Bearer plugin docs.
 */
export const authClient = createAuthClient({
  baseURL: backendUrl,
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("bearer_token") || "",
    },
    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        localStorage.setItem("bearer_token", authToken);
      }
    },
  },
});
