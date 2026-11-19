import { randomUUID } from 'node:crypto';
import type { ApiClient, ApiResponse } from '../client';

/**
 * Helpers for creating throwaway entities. Every spec should create the
 * mutable resources it needs (with unique names) and delete them in
 * `afterAll`; the seeded entities are shared and must stay read-only.
 */

export function uniqueName(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

/** Link/pixel slugs must be at least 8 characters. */
export function uniqueSlug(prefix: string) {
  return `${prefix}${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

export function uniqueDomain() {
  return `${uniqueName('site')}.test`;
}

export function assertStatus<T>(response: ApiResponse<T>, expected: number, label: string) {
  if (response.status !== expected) {
    throw new Error(
      `${label}: expected HTTP ${expected}, got ${response.status}: ${response.text}`,
    );
  }

  return response;
}

export async function createWebsite(client: ApiClient, overrides: Record<string, unknown> = {}) {
  const response = await client.post('/api/websites', {
    name: uniqueName('website'),
    domain: uniqueDomain(),
    ...overrides,
  });

  return assertStatus(response, 200, 'create website').body;
}

export async function deleteWebsite(client: ApiClient, websiteId: string) {
  await client.del(`/api/websites/${websiteId}`);
}

export async function createUser(admin: ApiClient, overrides: Record<string, unknown> = {}) {
  const password = 'throwaway-password';
  const response = await admin.post('/api/users', {
    username: uniqueName('user'),
    password,
    role: 'user',
    ...overrides,
  });

  return { ...assertStatus(response, 200, 'create user').body, password };
}

export async function deleteUser(admin: ApiClient, userId: string) {
  await admin.del(`/api/users/${userId}`);
}

/** POST /api/teams responds with `[team, teamUser]`. */
export async function createTeam(client: ApiClient, overrides: Record<string, unknown> = {}) {
  const response = await client.post('/api/teams', { name: uniqueName('team'), ...overrides });
  const [team, teamUser] = assertStatus(response, 200, 'create team').body;

  return { ...team, teamUser };
}

export async function deleteTeam(client: ApiClient, teamId: string) {
  await client.del(`/api/teams/${teamId}`);
}

export async function createLink(client: ApiClient, overrides: Record<string, unknown> = {}) {
  const response = await client.post('/api/links', {
    name: uniqueName('link'),
    url: 'https://umami.is/',
    slug: uniqueSlug('link'),
    ...overrides,
  });

  return assertStatus(response, 200, 'create link').body;
}

export async function deleteLink(client: ApiClient, linkId: string) {
  await client.del(`/api/links/${linkId}`);
}

export async function createPixel(client: ApiClient, overrides: Record<string, unknown> = {}) {
  const response = await client.post('/api/pixels', {
    name: uniqueName('pixel'),
    slug: uniqueSlug('pixel'),
    ...overrides,
  });

  return assertStatus(response, 200, 'create pixel').body;
}

export async function deletePixel(client: ApiClient, pixelId: string) {
  await client.del(`/api/pixels/${pixelId}`);
}
