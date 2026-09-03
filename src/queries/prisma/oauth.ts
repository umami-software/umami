import prisma from '@/lib/prisma';

export async function createOauthClient(data: {
  id: string;
  name: string;
  redirectUris: string[];
  metadata?: Record<string, unknown>;
}) {
  return prisma.client.oauthClient.create({
    data: {
      id: data.id,
      name: data.name,
      redirectUris: data.redirectUris,
      metadata: data.metadata as any,
    },
  });
}

export async function getOauthClient(id: string) {
  return prisma.client.oauthClient.findUnique({ where: { id } });
}

export async function createAuthorizationCode(data: {
  id: string;
  codeHash: string;
  userId: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  resource?: string | null;
  codeChallenge: string;
  codeChallengeMethod: string;
  expiresAt: Date;
}) {
  return prisma.client.oauthAuthorizationCode.create({ data });
}

/**
 * Atomically marks a code as used and returns it, or `null` when the code is unknown, expired or
 * has already been redeemed. Reuse of a code is a replay signal, handled by the caller.
 */
export async function consumeAuthorizationCode(codeHash: string) {
  const now = new Date();
  const { count } = await prisma.client.oauthAuthorizationCode.updateMany({
    where: { codeHash, usedAt: null, expiresAt: { gt: now } },
    data: { usedAt: now },
  });

  const code = await prisma.client.oauthAuthorizationCode.findUnique({ where: { codeHash } });

  if (!code) {
    return { code: null, replayed: null };
  }

  if (count === 1) {
    return { code, replayed: null };
  }

  // Code exists but was not consumable: either expired or already redeemed (replay).
  return { code: null, replayed: code.usedAt && code.usedAt < new Date() ? code : null };
}

export async function createRefreshToken(data: {
  id: string;
  tokenHash: string;
  userId: string;
  clientId: string;
  scope: string;
  resource?: string | null;
  expiresAt: Date;
}) {
  return prisma.client.oauthRefreshToken.create({ data });
}

export async function getRefreshTokenByHash(tokenHash: string) {
  return prisma.client.oauthRefreshToken.findUnique({ where: { tokenHash } });
}

export async function revokeRefreshToken(id: string) {
  const { count } = await prisma.client.oauthRefreshToken.updateMany({
    where: { id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return count;
}

export async function revokeRefreshTokensForClient(userId: string, clientId: string) {
  const { count } = await prisma.client.oauthRefreshToken.updateMany({
    where: { userId, clientId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return count;
}

export async function touchRefreshToken(id: string) {
  return prisma.client.oauthRefreshToken.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}

export async function deleteExpiredOauthRecords() {
  const now = new Date();
  const [codes, tokens] = await Promise.all([
    prisma.client.oauthAuthorizationCode.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.client.oauthRefreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
  ]);

  return { codes: codes.count, tokens: tokens.count };
}
