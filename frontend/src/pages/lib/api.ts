const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const authFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("access");

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Only set JSON header if body exists and it's not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
};