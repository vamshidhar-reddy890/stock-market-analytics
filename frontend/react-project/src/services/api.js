import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://stock-market-backend-9ay5.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRequest = error.config?.url?.includes("/auth/");
      const isPublicEndpoint =
        error.config?.url?.includes("/stocks") ||
        error.config?.url?.includes("/analytics") ||
        error.config?.url?.includes("/predictions") ||
        error.config?.url?.includes("/sentiment");

      if (!isAuthRequest && !isPublicEndpoint) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userName");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;