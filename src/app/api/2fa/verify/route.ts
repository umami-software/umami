import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getBearerToken, saveAuth } from '@/lib/auth';
import { ROLES } from '@/lib/constants';
import { secret } from '@/lib/crypto';
import { createSecureToken, parseSecureToken } from '@/lib/jwt';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { verifyBackupCode } from '@/lib/two-factor/backup-codes';
import { decryptSecret } from '@/lib/two-factor/crypto';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/two-factor/rate-limit';
import { isOtpReplayed, markOtpUsed } from '@/lib/two-factor/replay-prevention';
import { verifyTotp } from '@/lib/two-factor/totp';
import { getAllUserTeams, getUser } from '@/queries/prisma';
import redis from '@/lib/redis';

export async function POST(request: Request) {
  const schema = z.union([
    z.object({ token: z.string().length(6), backupCode: z.undefined() }),
    z.object({ backupCode: z.string().min(1), token: z.undefined() }),
  ]);

  // Validate partial auth token — skip normal session auth
  const rawToken = getBearerToken(request);
  if (!rawToken) {
    return unauthorized({ code: 'two-factor-error-missing-token' });
  }

  const payload = parseSecureToken(rawToken, secret()) as any;
  if (!payload || payload.type !== 'partial-auth' || !payload.userId) {
    return unauthorized({ code: 'two-factor-error-invalid-partial-token' });
  }

  const { body, error } = await parseRequest(request, schema, { skipAuth: true });
  if (error) {
    return error();
  }

  const userId = payload.userId as string;
  const user = await getUser(userId);

  if (!user) {
    return unauthorized();
  }

  const twoFactor = await prisma.client.twoFactorAuth.findUnique({ where: { userId } });

  if (!twoFactor?.isEnabled) {
    return badRequest({ code: 'two-factor-error-not-enabled', message: '2FA not enabled for this user' });
  }

  const rateCheck = await checkRateLimit(userId);
  if (!rateCheck.allowed) {
    return Response.json(
      {
        error: {
          code: 'two-factor-error-too-many-attempts',
          message: 'Too many failed attempts',
          lockedUntil: rateCheck.lockedUntil,
        },
      },
      { status: 429 },
    );
  }

  if (body.backupCode) {
    const unusedCodes = await prisma.client.twoFactorBackupCode.findMany({
      where: { userId, used: false },
    });
    const hashes = unusedCodes.map(c => c.codeHash);
    const matchIndex = await verifyBackupCode(body.backupCode, hashes);

    if (matchIndex === null) {
      await recordFailedAttempt(userId);
      return badRequest({
        code: 'two-factor-error-invalid-backup-code',
        message: 'Invalid backup code',
      });
    }

    await prisma.client.twoFactorBackupCode.update({
      where: { id: unusedCodes[matchIndex].id },
      data: { used: true },
    });
    await resetRateLimit(userId);
  } else {
    const { token } = body;

    if (await isOtpReplayed(userId, token)) {
      return badRequest({ code: 'two-factor-error-code-used', message: 'Code already used' });
    }

    const decryptedSecret = decryptSecret(twoFactor.secret);

    if (!(await verifyTotp(token, decryptedSecret))) {
      await recordFailedAttempt(userId);
      return badRequest({
        code: 'two-factor-error-invalid-code',
        message: 'Invalid verification code',
      });
    }

    await markOtpUsed(userId, token);
    await resetRateLimit(userId);
  }

  const { id, role, createdAt, username } = user;

  let fullToken: string;
  if (redis.enabled) {
    fullToken = await saveAuth({ userId: id, role });
  } else {
    fullToken = createSecureToken({ userId: id, role }, secret());
  }

  const teams = await getAllUserTeams(id);

  return json({
    token: fullToken,
    user: { id, username, role, createdAt, isAdmin: role === ROLES.admin, teams },
  });
}
