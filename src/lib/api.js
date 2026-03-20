const API_URL = import.meta.env.VITE_API_URL;
let isRefreshing = false;
let refreshQueue = [];

// Timeout configuration
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Helper for timeout promises
function timeoutPromise(ms, promise) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]);
}

// Token helpers
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

export async function api(
  path,
  { method = "GET", body = null, timeout = DEFAULT_TIMEOUT } = {}
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

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    // Handle 401 with token refresh
    if (res.status === 401) {
      if (path === '/auth/login' || path === '/auth/signup') {
        clearToken();
        window.location.href = "/";
        throw new Error("Invalid credentials");
      }

      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          
          refreshQueue.forEach(cb => cb(newToken));
          refreshQueue = [];
          
          // Retry with new token
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
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout: ${path}`);
    }
    throw error;
  }
}