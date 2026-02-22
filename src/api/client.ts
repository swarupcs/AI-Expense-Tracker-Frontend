// ─── Authenticated HTTP Client ────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4100/api';
export { BASE_URL };

// ─── Token storage ────────────────────────────────────────────────────────────
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

// ─── Silent refresh ───────────────────────────────────────────────────────────
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

// ─── Core request ─────────────────────────────────────────────────────────────
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
