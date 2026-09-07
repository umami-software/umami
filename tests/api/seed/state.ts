import { readFileSync } from 'node:fs';
import { SEED_FILE } from '../paths';

export interface SeedCredentials {
  id: string;
  username: string;
  password: string;
  role: string;
}

/** Written by global setup to tests/api/.runtime/seed.json and read by the fixtures. */
export interface SeedState {
  db: 'postgres' | 'clickhouse';
  createdAt: string;
  admin: SeedCredentials;
  user: SeedCredentials;
  viewer: SeedCredentials;
  /** Admin-owned website carrying the full analytics dataset. */
  website: { id: string; name: string; domain: string };
  /** Website owned by `user` with a small dataset. */
  website2: { id: string; name: string; domain: string };
  link: { id: string; name: string; url: string; slug: string };
  pixel: { id: string; name: string; slug: string };
  team: { id: string; name: string; accessCode: string };
  /** Share for `website` granting every section. */
  share: { id: string; slug: string };
  /** Dataset window in ms. */
  range: { startAt: number; endAt: number };
  data: {
    hostname: string;
    currency: string;
    pages: string[];
    eventNames: string[];
    distinctIds: string[];
    expectedPageviews: number;
    expectedWebsite2Pageviews: number;
    /** A session id from `website` (used for /sessions/{sessionId} endpoints). */
    sessionId: string;
    /** A custom event id with event data (used for /event-data/{eventId}). */
    eventId: string;
    /** Visit id of the recorded replay (replay ids are visit ids). */
    replayVisitId: string;
    replaySessionId: string;
  };
}

export function readSeedState(): SeedState {
  return JSON.parse(readFileSync(SEED_FILE, 'utf8'));
}
