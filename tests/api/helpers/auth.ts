import type { ApiClient } from '../client';

export interface Credentials {
  username: string;
  password: string;
}

export async function login(api: ApiClient, { username, password }: Credentials) {
  const response = await api.post('/api/auth/login', { username, password });

  if (response.status !== 200 || !response.body?.token) {
    throw new Error(`Login failed for ${username} (${response.status}): ${response.text}`);
  }

  return response.body.token as string;
}
