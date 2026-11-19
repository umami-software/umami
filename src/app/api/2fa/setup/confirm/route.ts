import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound, serviceUnavailable } from '@/lib/response';
import { generateBackupCodes } from '@/lib/two-factor/backup-codes';
import {
  decryptSecret,
  getTwoFactorConfigurationError,
  isTwoFactorConfigured,
} from '@/lib/two-factor/crypto';
import { reserveAttempt, resetRateLimit } from '@/lib/two-factor/rate-limit';
import { claimOtp } from '@/lib/two-factor/replay-prevention';
import { verifyTotp } from '@/lib/two-factor/totp';

export async function POST(request: Request) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const schema = z.object({ token: z.string().length(6) });

  const { auth, body, error } = await parseRequest(request, schema, { allowTwoFactorSetup: true });

  if (error) {
    return error();
  }

  if (!isTwoFactorConfigured()) {
    return serviceUnavailable(getTwoFactorConfigurationError());
  }

  const userId = auth.user.id;
  const { token } = body;

  const twoFactor = await prisma.client.twoFactorAuth.findUnique({ where: { userId } });

  // Verify if 2FA is waiting for setup
  if (!twoFactor || twoFactor.isEnabled) {
    return badRequest({
      code: 'two-factor-error-no-pending-setup',
      message: 'No pending 2FA setup found',
    });
  }

  // Verify rate limit
  const rateCheck = await reserveAttempt(userId);
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

  // Verify TOTP
  const secret = decryptSecret(twoFactor.secret);
  if (!(await verifyTotp(token, secret))) {
    const { lockedUntil } = rateCheck;
    return badRequest({
      code: 'two-factor-error-invalid-code',
      message: 'Invalid verification code',
      ...(lockedUntil && { lockedUntil }),
    });
  }

  // Prevent OTP replay
  if (!(await claimOtp(userId, token))) {
    return badRequest({ code: 'two-factor-error-code-used', message: 'Code already used' });
  }

  const { plaintext, hashed } = await generateBackupCodes();

  await prisma.transaction(async tx => {
    await tx.twoFactorAuth.update({ where: { userId }, data: { isEnabled: true } });
    await tx.twoFactorBackupCode.deleteMany({ where: { userId } });
    await tx.twoFactorBackupCode.createMany({
      data: hashed.map(codeHash => ({ userId, codeHash })),
    });
  });

  await resetRateLimit(userId);

  return json({ backupCodes: plaintext });
}
