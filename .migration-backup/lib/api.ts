/**
 * GEN ERA — Base API Client
 * Typed fetch wrapper for the Express backend at /api/v1/
 */

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('genEraToken');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.set(key, val);
      }
    });
  }

  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(url.toString(), { ...options, headers });

  const data = await res.json().catch(() => ({ success: false, message: 'Invalid JSON response' }));

  if (!res.ok) {
    throw Object.assign(new Error(data.message || `HTTP ${res.status}`), {
      status: res.status,
      data,
    });
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string>) =>
    request<T>(path, { method: 'GET' }, params),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = { success: boolean; message: string }>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
};
