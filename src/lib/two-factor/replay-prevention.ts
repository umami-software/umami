import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

type TxClient = Prisma.TransactionClient;

/** Records a one-time password as used so it cannot be reused within the next 90 seconds. */
export async function markOtpUsed(userId: string, otp: string, tx?: TxClient): Promise<void> {
  const client = tx ?? prisma.client;
  const expiresAt = new Date(Date.now() + 90 * 1000);
  await client.twoFactorOtpUsed.upsert({
    where: { userId_otp: { userId, otp } },
    update: { expiresAt },
    create: { userId, otp, expiresAt },
  });
}

/** Returns true if this one-time password was already used recently, indicating a replay attack. Expired records are cleaned up automatically. */
export async function isOtpReplayed(userId: string, otp: string): Promise<boolean> {
  const record = await prisma.client.twoFactorOtpUsed.findUnique({
    where: { userId_otp: { userId, otp } },
  });
  if (!record) return false;
  if (record.expiresAt < new Date()) {
    await prisma.client.twoFactorOtpUsed.delete({ where: { userId_otp: { userId, otp } } });
    return false;
  }
  return true;
}
