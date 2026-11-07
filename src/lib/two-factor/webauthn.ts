import { getBearerToken } from '@/lib/auth';
import { PARTIAL_AUTH_TOKEN_TYPE } from '@/lib/constants';
import { secret } from '@/lib/crypto';
import { getBaseUrl } from '@/lib/get-base-url';
import { parseSecureToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export const WEBAUTHN_TIMEOUT = 60 * 1000;

const CHALLENGE_TTL = 5 * 60 * 1000;

export type WebAuthnChallengeType = 'registration' | 'authentication';

export interface RelyingParty {
  rpID: string;
  rpName: string;
  origin: string[];
}

/**
 * Resolves the WebAuthn relying party. WEBAUTHN_ORIGIN (comma-separated) and WEBAUTHN_RP_ID
 * override the defaults, which are derived from the request's host.
 */
export function getRelyingParty(request: Request): RelyingParty {
  const origin = (process.env.WEBAUTHN_ORIGIN || '')
    .split(',')
    .map(value => value.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (!origin.length) {
    origin.push(getBaseUrl(request.headers).origin);
  }

  return {
    rpID: process.env.WEBAUTHN_RP_ID || new URL(origin[0]).hostname,
    rpName: process.env.WEBAUTHN_RP_NAME || 'Umami',
    origin,
  };
}

/** Returns the user ID from a partial sign-in token, or null if the token is missing or invalid. */
export function getPartialAuthUserId(request: Request): string | null {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const payload = parseSecureToken(token, secret()) as any;

  if (!payload || payload.type !== PARTIAL_AUTH_TOKEN_TYPE || !payload.userId) {
    return null;
  }

  return payload.userId;
}

/** Stores a challenge for the user, replacing any pending challenge of the same type. */
export async function saveChallenge(
  userId: string,
  type: WebAuthnChallengeType,
  challenge: string,
): Promise<void> {
  const expiresAt = new Date(Date.now() + CHALLENGE_TTL);

  await prisma.client.webAuthnChallenge.upsert({
    where: { userId_type: { userId, type } },
    update: { challenge, expiresAt },
    create: { userId, type, challenge, expiresAt },
  });
}

/** Removes and returns the user's pending challenge. Each challenge can only be consumed once. */
export async function consumeChallenge(
  userId: string,
  type: WebAuthnChallengeType,
): Promise<string | null> {
  const record = await prisma.client.webAuthnChallenge.findUnique({
    where: { userId_type: { userId, type } },
  });

  if (!record) {
    return null;
  }

  const { count } = await prisma.client.webAuthnChallenge.deleteMany({
    where: { id: record.id, challenge: record.challenge },
  });

  if (!count || record.expiresAt < new Date()) {
    return null;
  }

  return record.challenge;
}
