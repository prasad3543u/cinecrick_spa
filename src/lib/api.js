const API_URL = import.meta.env.VITE_API_URL;

// -----------------------------
// Token helpers
// -----------------------------
export function getToken() {
  return localStorage.getItem("cinecrick_token");
}

export function setToken(token) {
  localStorage.setItem("cinecrick_token", token);
}

export function clearToken() {
  localStorage.removeItem("cinecrick_token");
  localStorage.removeItem("cinecrick_user");
  localStorage.removeItem("cinecrick_logged_in");
}

// -----------------------------
// API request helper
// -----------------------------
export async function api(
  path,
  { method = "GET", body = null } = {}
) {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not defined in environment variables");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  // Auto-attach token if present
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));

  // Auto logout if token expired
  if (res.status === 401) {
    clearToken();
    window.location.href = "/";
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      (Array.isArray(data?.errors)
        ? data.errors.join(", ")
        : "Request failed");
    throw new Error(msg);
  }

  return data;
}