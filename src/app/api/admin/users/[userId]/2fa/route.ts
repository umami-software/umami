import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json, notFound, unauthorized } from '@/lib/response';
import { updateUser } from '@/queries/prisma/user';
import { canEnforceTwoFactorAuthForUser } from '@/permissions';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (!(await canEnforceTwoFactorAuthForUser(auth))) {
    return unauthorized();
  }

  const { userId } = await params;

  const twoFactor = await prisma.client.twoFactorAuth.findUnique({ where: { userId } });

  return json({ isEnabled: twoFactor?.isEnabled ?? false });
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const schema = z.object({ required: z.boolean() });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canEnforceTwoFactorAuthForUser(auth))) {
    return unauthorized();
  }

  const { userId } = await params;
  const { required } = body;

  const user = await updateUser(userId, { twoFactorRequired: required });

  return json({ ok: true, userId: user.id, twoFactorRequired: required });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (process.env.CLOUD_MODE) {
    return notFound();
  }

  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (!(await canEnforceTwoFactorAuthForUser(auth))) {
    return unauthorized();
  }

  const { userId } = await params;

  const [twoFactorAuth, backupCodes, otpUsed, rateLimit] = await prisma.transaction([
    prisma.client.twoFactorAuth.deleteMany({ where: { userId } }),
    prisma.client.twoFactorBackupCode.deleteMany({ where: { userId } }),
    prisma.client.twoFactorOtpUsed.deleteMany({ where: { userId } }),
    prisma.client.twoFactorRateLimit.deleteMany({ where: { userId } }),
  ]);

  return json({
    ok: true,
    userId,
    reset: {
      twoFactorAuth: twoFactorAuth.count,
      backupCodes: backupCodes.count,
      otpUsed: otpUsed.count,
      rateLimit: rateLimit.count,
    },
  });
}
