import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const MAX_RETRIES = 3;

export async function checkRateLimit(
  userId: string,
): Promise<{ allowed: boolean; lockedUntil?: Date }> {
  const record = await prisma.client.twoFactorRateLimit.findUnique({ where: { userId } });
  if (!record) return { allowed: true };
  if (record.lockedUntil && record.lockedUntil > new Date()) {
    return { allowed: false, lockedUntil: record.lockedUntil };
  }
  return { allowed: true };
}

export async function recordFailedAttempt(userId: string): Promise<{ lockedUntil?: Date }> {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      /*
      prisma.transaction accepts `any` to support both batch and callback forms,
      so TypeScript resolves to the batch overload and infers `any[]`. Cast is safe:
      the callback form always returns the callback's return type.
       */
      return await (prisma.transaction(
        async (tx: Prisma.TransactionClient): Promise<{ lockedUntil?: Date }> => {
          const record = await tx.twoFactorRateLimit.upsert({
            where: { userId },
            update: { attempts: { increment: 1 } },
            create: { userId, attempts: 1 },
          });
          if (record.attempts >= MAX_ATTEMPTS) {
            const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
            await tx.twoFactorRateLimit.update({ where: { userId }, data: { lockedUntil } });
            return { lockedUntil };
          }
          return {};
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ) as Promise<{ lockedUntil?: Date }>);
    } catch (err: any) {
      if (err.code === 'P2034') {
        retries++;
        continue;
      }
      throw err;
    }
  }
  throw new Error('recordFailedAttempt: max retries exceeded');
}

export async function resetRateLimit(userId: string): Promise<void> {
  await prisma.client.twoFactorRateLimit.deleteMany({ where: { userId } });
}
