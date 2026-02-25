const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4100/api';
export { BASE_URL };

export const tokenStorage = {
  getAccess: (): string | null => localStorage.getItem('accessToken'),
  getRefresh: (): string | null => localStorage.getItem('refreshToken'),
  set: (access: string, refresh: string): void => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },
  clear: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      tokenStorage.clear();
      return false;
    }
    const body = await res.json();
    const { accessToken, refreshToken: newRefresh } = body.data.tokens;
    tokenStorage.set(accessToken, newRefresh);
    return true;
  } catch {
    tokenStorage.clear();
    return false;
  }
}

/**
 * Builds Authorization headers using the current access token.
 * Merges with any headers already in `init`.
 */
function authHeaders(init: RequestInit = {}): Record<string, string> {
  const token = tokenStorage.getAccess();
  return {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * A fetch wrapper for endpoints that need token refresh but return
 * a raw Response (e.g. SSE streams, file downloads) rather than JSON.
 *
 * On 401 it attempts a token refresh once, updates the Authorization
 * header with the new token, and retries the request.
 * On repeated 401 (refresh failed) it clears storage and redirects to /login.
 */
export async function fetchWithAuth(
  url: string,
  init: RequestInit = {},
  retry = true,
): Promise<Response> {
  const res = await fetch(url, { ...init, headers: authHeaders(init) });

  if (res.status === 401 && retry) {
    if (!refreshPromise) refreshPromise = doRefresh();
    const refreshed = await refreshPromise;
    refreshPromise = null;

    if (refreshed) {
      // Retry with the freshly-minted token
      return fetchWithAuth(url, init, false);
    }

    tokenStorage.clear();
    window.location.href = '/login';
    // Return the 401 response so callers can handle it if needed
    return res;
  }

  return res;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const token = tokenStorage.getAccess();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    if (!refreshPromise) refreshPromise = doRefresh();
    const refreshed = await refreshPromise;
    refreshPromise = null;
    if (refreshed) return request<T>(path, options, false);
    tokenStorage.clear();
    window.location.href = '/login';
    return { success: false, error: 'Session expired' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.error ?? `HTTP ${res.status}` };
  }
  return res.json();
}