import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { badRequest, json, unauthorized } from '@/lib/response';
import { generateBackupCodes } from '@/lib/two-factor/backup-codes';
import { decryptSecret } from '@/lib/two-factor/crypto';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/two-factor/rate-limit';
import { isOtpReplayed, markOtpUsed } from '@/lib/two-factor/replay-prevention';
import { verifyTotp } from '@/lib/two-factor/totp';

export async function POST(request: Request) {
  const schema = z.object({ token: z.string().length(6) });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const userId = auth.user.id;
  const { token } = body;

  const twoFactor = await prisma.client.twoFactorAuth.findUnique({ where: { userId } });

  // Verify if 2FA is waiting for setup
  if (!twoFactor || twoFactor.isEnabled) {
    return badRequest({ message: 'No pending 2FA setup found' });
  }

  // Verify rate limit
  const rateCheck = await checkRateLimit(userId);
  if (!rateCheck.allowed) {
    return badRequest({
      code: 'rate-limited',
      message: 'Too many failed attempts',
      lockedUntil: rateCheck.lockedUntil,
    });
  }

  // Prevent OTP replay
  if (await isOtpReplayed(userId, token)) {
    return badRequest({ code: 'otp-replayed', message: 'Code already used' });
  }

  // Verify TOTP
  const secret = decryptSecret(twoFactor.secret);
  if (!(await verifyTotp(token, secret))) {
    await recordFailedAttempt(userId);
    return badRequest({
      code: 'two-factor-error-invalid-code',
      message: 'Invalid verification code',
    });
  }

  await prisma.client.twoFactorAuth.update({ where: { userId }, data: { isEnabled: true } });
  await markOtpUsed(userId, token);
  await resetRateLimit(userId);

  const { plaintext, hashed } = await generateBackupCodes();

  await prisma.client.twoFactorBackupCode.deleteMany({ where: { userId } });
  await prisma.client.twoFactorBackupCode.createMany({
    data: hashed.map(codeHash => ({ userId, codeHash })),
  });

  return json({ backupCodes: plaintext });
}
