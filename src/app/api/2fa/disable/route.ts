import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { badRequest, forbidden, json } from '@/lib/response';
import { decryptSecret } from '@/lib/two-factor/crypto';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/two-factor/rate-limit';
import { isOtpReplayed, markOtpUsed } from '@/lib/two-factor/replay-prevention';
import { verifyTotp } from '@/lib/two-factor/totp';
import { checkPassword } from '@/lib/password';
import { getUser } from '@/queries/prisma/user';

export async function POST(request: Request) {
  const schema = z.object({
    password: z.string(),
    token: z.string().length(6),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const userId = auth.user.id;
  const { password, token } = body;

  // Globally required
  const globalSetting = await prisma.client.appSetting.findUnique({
    where: { key: 'twoFactorRequiredGlobal' },
  });
  const isGlobalRequired = globalSetting?.value === 'true';

  // Required for this user
  const userRecord = await prisma.client.user.findUnique({
    where: { id: userId },
    select: { twoFactorRequired: true },
  });
  const isUserRequired = userRecord?.twoFactorRequired ?? false;

  // Required for this user's teams
  const userTeams = await prisma.client.teamUser.findMany({ where: { userId } });
  const teamIds = userTeams.map(t => t.teamId);
  const teamsWithRequirement = teamIds.length
    ? await prisma.client.team.findMany({
        where: { id: { in: teamIds }, twoFactorRequired: true },
      })
    : [];
  const isTeamRequired = teamsWithRequirement.length > 0;

  // Cannot disable 2FA if required
  if (isGlobalRequired || isUserRequired || isTeamRequired) {
    return forbidden({
      code: 'two-factor-error-disable-not-allowed',
      message: '2FA is required and cannot be disabled',
    });
  }

  // Verify password
  const userWithPw = await getUser(userId, { includePassword: true });
  if (!userWithPw || !checkPassword(password, userWithPw.password)) {
    return badRequest({
      code: 'two-factor-error-incorrect-password',
      message: 'Incorrect password',
    });
  }

  // Verify if 2FA is enabled
  const twoFactor = await prisma.client.twoFactorAuth.findUnique({ where: { userId } });
  if (!twoFactor?.isEnabled) {
    return badRequest({ code: 'two-factor-error-not-enabled', message: '2FA is not enabled' });
  }

  // Verify rate limit
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

  // Prevent OTP replay
  if (await isOtpReplayed(userId, token)) {
    return badRequest({ code: 'two-factor-error-code-used', message: 'Code already used' });
  }

  // Verify TOTP
  const secret = decryptSecret(twoFactor.secret);
  if (!(await verifyTotp(token, secret))) {
    const { lockedUntil } = await recordFailedAttempt(userId);
    return badRequest({
      code: 'two-factor-error-invalid-code',
      message: 'Invalid verification code',
      ...(lockedUntil && { lockedUntil }),
    });
  }

  await prisma.transaction(async tx => {
    await markOtpUsed(userId, token, tx);
    await tx.twoFactorAuth.delete({ where: { userId } });
    await tx.twoFactorBackupCode.deleteMany({ where: { userId } });
  });
  await resetRateLimit(userId);

  return json({ ok: true });
}
