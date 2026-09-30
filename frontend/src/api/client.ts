const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function normalizeUrl(baseUrl: string, endpoint: string): string {
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.trim().startsWith('/') ? endpoint.trim() : `/${endpoint.trim()}`;
  return `${cleanBase}${cleanEndpoint}`;
}

async function fetchFromBase<T>(baseUrl: string, endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('nagriklens_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const targetUrl = normalizeUrl(baseUrl, endpoint);
  const response = await fetch(targetUrl, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network request failed' }));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return fetchFromBase(RAW_API_BASE_URL, endpoint, options);
}

export async function apiFetchRoot<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const rootUrl = RAW_API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
  return fetchFromBase(rootUrl, endpoint, options);
}
