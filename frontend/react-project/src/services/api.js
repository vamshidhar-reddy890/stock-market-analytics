import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9090/api",
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
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isAuthRequest = error.config?.url?.includes("/auth/");
      if (!isAuthRequest) {
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