const BASE_URL = typeof window === 'undefined'
  ? (process.env.API_URL || 'http://api:3001')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
const API_PREFIX = '/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${API_PREFIX}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body || res.statusText);
  }

  return res.json();
}

async function authRequest<T>(path: string, token: string, options?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export const authApi = {
  get: <T>(path: string, token: string, options?: RequestInit) => authRequest<T>(path, token, { method: 'GET', ...options }),
  post: <T>(path: string, token: string, body?: unknown) =>
    authRequest<T>(path, token, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, token: string, body?: unknown) =>
    authRequest<T>(path, token, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, token: string) => authRequest<T>(path, token, { method: 'DELETE' }),
};
