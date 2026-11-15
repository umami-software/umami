/**
 * Constants mirrored from src/lib/constants.ts. The API suite deliberately does
 * not import from src/ (server-only modules, path aliases), so keep these in
 * sync by hand — they change rarely.
 */

/** Created by prisma/migrations/01_init on first boot. */
export const ADMIN_USER = {
  id: '41e2b680-648e-4b09-bcd7-3e2b10c06264',
  username: 'admin',
  password: 'umami',
  role: 'admin',
} as const;

export const ROLES = {
  admin: 'admin',
  user: 'user',
  viewOnly: 'view-only',
  teamOwner: 'team-owner',
  teamManager: 'team-manager',
  teamMember: 'team-member',
  teamViewOnly: 'team-view-only',
} as const;

export const EVENT_TYPE = {
  pageView: 1,
  customEvent: 2,
  linkEvent: 3,
  pixelEvent: 4,
  performance: 5,
} as const;

export const ENTITY_TYPE = {
  website: 1,
  link: 2,
  pixel: 3,
  board: 4,
} as const;

export const SHARE_TOKEN_HEADER = 'x-umami-share-token';
export const SHARE_CONTEXT_HEADER = 'x-umami-share-context';
export const CACHE_HEADER = 'x-umami-cache';

/** A syntactically valid v4 UUID that never exists in the database. */
export const UNKNOWN_UUID = '00000000-0000-4000-8000-000000000000';
