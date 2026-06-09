const BASE = "http://localhost:3000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function req(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Auth
export const register = (body) =>
  req("/auth/register", { method: "POST", body: JSON.stringify(body) });

export const login = (body) =>
  req("/auth/login", { method: "POST", body: JSON.stringify(body) });

// Tasks
export const getTasks = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return req(`/tasks${q ? "?" + q : ""}`);
};

export const getTask = (id) => req(`/tasks/${id}`);

export const createTask = (body) => {
  req("/tasks", { method: "POST", body: JSON.stringify(body) });
};

export const updateTask = (id, body) =>
  req(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteTask = (id) => req(`/tasks/${id}`, { method: "DELETE" });

export const getStats = () => req("/tasks/stats");
