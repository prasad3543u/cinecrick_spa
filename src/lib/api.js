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
}

// -----------------------------
// API request helper
// -----------------------------
export async function api(
  path,
  { method = "GET", body = null, auth = false } = {}
) {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not defined in environment variables");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  // attach JWT token if required
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
      `Request failed (${res.status})`;

    throw new Error(msg);
  }

  return data;
}