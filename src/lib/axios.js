import axios from "axios";
import { tokenStorage } from "../utils/tokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // JWT is sent via Authorization header — cookies not used
  withCredentials: false,
});

// Attach JWT to every outgoing request if one is stored
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize API errors and auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    if (status === 401) {
      tokenStorage.remove();
      if (typeof window !== "undefined") {
        const path = window.location.pathname || "";
        const onAuth = /\/login|\/signup/i.test(path);
        if (!onAuth) window.location.assign("/login");
      }
    }

    // Preserve status on the new error so catch blocks can read error.status
    const msg = err?.response?.data?.message || err.message || "Request failed";
    const normalized = new Error(msg);
    normalized.status = status;
    return Promise.reject(normalized);
  }
);

export default api;