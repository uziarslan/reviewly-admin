const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("admin_token");

  const config = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "API request failed");
    err.status = res.status;
    throw err;
  }

  return data;
}

/* ── Admin auth ──────────────────────────────── */
export const adminAuthAPI = {
  login: (email, password) =>
    apiFetch("/admin/login", { method: "POST", body: { email, password } }),
  getMe: () => apiFetch("/admin/me"),
};

/* ── User management ─────────────────────────── */
export const usersAPI = {
  getAll: (page = 1, limit = 10, search = "") =>
    apiFetch(
      `/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(
        search
      )}`
    ),
  update: (id, data) =>
    apiFetch(`/admin/users/${id}`, { method: "PUT", body: data }),
  remove: (id) =>
    apiFetch(`/admin/users/${id}`, { method: "DELETE" }),
};

/* ── Analytics ───────────────────────────────── */
export const analyticsAPI = {
  getOverview: (days = 30) =>
    apiFetch(`/admin/analytics/overview?days=${days}`),
  getExams: (days = 30) =>
    apiFetch(`/admin/analytics/exams?days=${days}`),
  getUsers: (days = 30) =>
    apiFetch(`/admin/analytics/users?days=${days}`),
  getRetention: (days = 30) =>
    apiFetch(`/admin/analytics/retention?days=${days}`),
};
