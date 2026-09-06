/**
 * Fixed identifiers for seeded entities. Using fixed UUIDs lets global setup
 * find and recreate them on re-runs against a kept stack (`--keep`).
 */
export const SEED_IDS = {
  website: '1e5a0000-0000-4000-8000-000000000001',
  website2: '1e5a0000-0000-4000-8000-000000000002',
  link: '1e5a0000-0000-4000-8000-000000000003',
  pixel: '1e5a0000-0000-4000-8000-000000000004',
} as const;

export const SEED_USERS = {
  /** Regular user; owns the secondary website. */
  user: { username: 'api-user', password: 'api-user-password', role: 'user' },
  /** View-only user that owns nothing — used for permission-denied cases. */
  viewer: { username: 'api-viewer', password: 'api-viewer-password', role: 'view-only' },
} as const;

export const SEED_WEBSITES = {
  primary: { name: 'API Test Website', domain: 'example.test' },
  secondary: { name: 'API Test Website (user)', domain: 'user.example.test' },
} as const;

export const SEED_LINK = { name: 'API Test Link', url: 'https://umami.is/', slug: 'apitestlink' };
export const SEED_PIXEL = { name: 'API Test Pixel', slug: 'apitestpixel' };
export const SEED_TEAM = { name: 'API Test Team' };
export const SEED_SHARE = { name: 'API Test Share' };
