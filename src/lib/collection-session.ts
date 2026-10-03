import { startOfHour } from 'date-fns';
import { getSalt, hash, uuid } from './crypto';

export interface CollectionCache {
  websiteId: string;
  sessionId: string;
  visitId: string;
  iat: number;
  sessionLinkId?: string;
}

export function resolveCollectionSession({
  sourceId,
  ip,
  userAgent,
  distinctId,
  createdAt,
  cache,
  historical = false,
}: {
  sourceId: string;
  ip: string;
  userAgent: string;
  distinctId?: string;
  createdAt: Date;
  cache?: CollectionCache | null;
  historical?: boolean;
}) {
  const now = Math.floor(Date.now() / 1000);
  const sessionSalt = getSalt(process.env.SALT_ROTATION, createdAt);
  const visitSalt = hash(startOfHour(createdAt).toUTCString());
  const sessionId = uuid(sourceId, ip, userAgent, sessionSalt, distinctId ?? '');
  const sessionDrift = !!cache?.sessionId && cache.sessionId !== sessionId;
  let visitId = cache?.visitId || uuid(sessionId, visitSalt);
  let iat = cache?.iat || now;
  if (sessionDrift || (!historical && now - iat > 1800)) {
    visitId = uuid(sessionId, visitSalt);
    iat = now;
  }
  return { sessionId, visitId, iat, sessionDrift };
}
