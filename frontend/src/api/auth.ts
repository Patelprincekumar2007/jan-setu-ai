import { apiFetch } from './client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'citizen' | 'analyst' | 'admin';
  is_active: boolean;
}

export async function loginApi(email: string, password: string): Promise<{ access_token: string }> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerApi(data: { email: string; password: string; full_name: string; role?: string }): Promise<User> {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCurrentUserApi(): Promise<User> {
  return apiFetch('/auth/me');
}
