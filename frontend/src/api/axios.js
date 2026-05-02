import axios from "axios";

const instance = axios.create({
  baseURL: "https://cognitive-backend-2cs1.onrender.com/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and specific to TokenExpired, and we haven't retried yet
    if (
      error.response?.status === 401 &&
      error.response?.data?.error === "TokenExpired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Request a new token directly with axios to avoid loop
        const res = await axios.post("https://cognitive-backend-2cs1.onrender.com/api/auth/refresh", {
          token: refreshToken,
        });

        const newAccessToken = res.data.token;
        const newRefreshToken = res.data.refreshToken;

        // Save new tokens
        localStorage.setItem("token", newAccessToken);
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

        // Update the original request's authorization header and replay it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // Refresh token failed (e.g., it expired or was revoked)
        console.error("Refresh token failed, logging out...");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login"; // Force redirect to login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;