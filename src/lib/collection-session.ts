import { startOfHour } from 'date-fns';
import { getSalt, hash, uuid } from './crypto';

export interface CollectionCache {
  websiteId: string;
  sessionId: string;
  visitId: string;
  iat: number;
  sessionLinkId?: string;
}

type ResolveCollectionSessionArgs = Parameters<typeof resolveCollectionSession>[0];

export type ClaimAnonymousSession = (args: {
  websiteId: string;
  sessionId: string;
  distinctId: string;
  createdAt: Date;
}) => Promise<boolean>;

/**
 * Resolves the session for a tracked request, reusing the visitor's anonymous
 * session after they identify, but only if:
 *  - the client fingerprint (IP/UA) has not genuinely changed
 *  - the session is not already claimed by a different identity
 *
 * Every collection path (events, identify, errors) must use this so the same
 * visitor always lands in the same session.
 */
export async function resolveIdentifiedSession({
  websiteId,
  claimSession,
  ...args
}: ResolveCollectionSessionArgs & {
  websiteId?: string;
  claimSession: ClaimAnonymousSession;
}) {
  const session = resolveCollectionSession(args);
  const { distinctId, cache } = args;

  // sessionDrift is true whenever cache.sessionId !== computed sessionId.
  // That includes the normal identify transition (distinctId changes the hash).
  // To tell apart "same client, new identity" from "different client", we
  // recompute the session ID without distinctId and compare to the cached one.
  if (!websiteId || !distinctId || !cache?.sessionId || !session.sessionDrift) {
    return session;
  }

  // Resolved without distinctId, so its visit state has not been reset by
  // the identity drift: it keeps the cached visit and applies the normal
  // 30-minute expiry.
  const fingerprint = resolveCollectionSession({ ...args, distinctId: undefined });

  // If the fingerprint-only ID still doesn't match the cache, the client
  // itself changed (IP or UA rotation) — do not reuse.
  if (fingerprint.sessionId !== cache.sessionId) {
    return session;
  }

  // Fast path: the cache token already proves this user owns the session
  if (cache.sessionLinkId === hash(cache.sessionId, distinctId)) {
    return fingerprint;
  }

  // Slow path: atomically check-and-claim the session so concurrent
  // identities cannot both claim the same anonymous session.
  try {
    if (
      await claimSession({
        websiteId,
        sessionId: cache.sessionId,
        distinctId,
        createdAt: args.createdAt,
      })
    ) {
      return fingerprint;
    }
  } catch {
    // Best-effort: if the claim fails, fall through to the new session
    // so collection is never blocked by an identity-link read failure.
  }

  return session;
}

export function resolveCollectionSession({
  sourceId,
  ip,
  userAgent,
  distinctId,
  salt,
  createdAt,
  cache,
  historical = false,
}: {
  sourceId: string;
  ip: string;
  userAgent: string;
  distinctId?: string;
  salt?: string;
  createdAt: Date;
  cache?: CollectionCache | null;
  historical?: boolean;
}) {
  const now = Math.floor(Date.now() / 1000);
  const baseSalt = getSalt(process.env.SALT_ROTATION, createdAt);
  // A client salt is mixed into the server salt, never a replacement for it, so
  // it can only split sessions further. Ignored unless ENABLE_CLIENT_SALT is set.
  const sessionSalt = process.env.ENABLE_CLIENT_SALT && salt ? hash(baseSalt, salt) : baseSalt;
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
