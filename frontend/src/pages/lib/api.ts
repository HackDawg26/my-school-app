export const authFetch = (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("access");

  return fetch(`http://127.0.0.1:8000${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};
