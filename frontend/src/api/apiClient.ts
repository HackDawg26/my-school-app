const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function authFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("access");

  if (!token) {
    throw new Error("Access token not found.");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  return response;
}