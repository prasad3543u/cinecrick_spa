const API_URL = import.meta.env.VITE_API_URL;
let isRefreshing = false;
let refreshQueue = [];

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
// Token refresh function
// -----------------------------
async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh_token`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) throw new Error("Refresh failed");
    
    const data = await response.json();
    setToken(data.token);
    return data.token;
  } catch (error) {
    clearToken();
    throw error;
  }
}

// -----------------------------
// API request helper with auto-refresh
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

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json().catch(() => ({}));

    // Handle 401 with token refresh
    if (res.status === 401) {
      // Don't attempt refresh on login endpoint
      if (path === '/auth/login' || path === '/auth/signup') {
        clearToken();
        window.location.href = "/";
        throw new Error("Invalid credentials");
      }

      // Queue failed requests while refreshing
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          
          // Retry queued requests
          refreshQueue.forEach(cb => cb(newToken));
          refreshQueue = [];
          
          // Retry this request
          headers.Authorization = `Bearer ${newToken}`;
          const retryRes = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null,
          });
          
          const retryData = await retryRes.json().catch(() => ({}));
          
          if (!retryRes.ok) {
            throw new Error(retryData?.error || "Request failed after token refresh");
          }
          
          return retryData;
        } catch (refreshError) {
          isRefreshing = false;
          refreshQueue = [];
          clearToken();
          window.location.href = "/";
          throw new Error("Session expired. Please login again.");
        }
      } else {
        // Wait for refresh to complete
        return new Promise((resolve, reject) => {
          refreshQueue.push(async (newToken) => {
            try {
              headers.Authorization = `Bearer ${newToken}`;
              const retryRes = await fetch(`${API_URL}${path}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : null,
              });
              
              const retryData = await retryRes.json().catch(() => ({}));
              
              if (!retryRes.ok) {
                throw new Error(retryData?.error || "Request failed");
              }
              
              resolve(retryData);
            } catch (error) {
              reject(error);
            }
          });
        });
      }
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
  } catch (error) {
    throw error;
  }
}