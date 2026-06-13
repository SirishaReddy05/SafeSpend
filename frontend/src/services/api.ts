import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser) as { token?: string };
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      localStorage.removeItem("user");
    }
  }
  return config;
});

export const withUserId = <T extends Record<string, unknown>>(payload: T, userId: string) => ({
  ...payload,
  userId,
});
