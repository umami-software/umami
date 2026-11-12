import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const MAX_RETRIES = 3;

/**
 * Counts an attempt before the code is checked, so concurrent guesses cannot all pass the lockout
 * gate before any failure is recorded. The attempt that reaches the limit is allowed but returns
 * `lockedUntil`; a successful verification clears it via resetRateLimit.
 */
export async function reserveAttempt(
  userId: string,
): Promise<{ allowed: boolean; lockedUntil?: Date }> {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      /*
      prisma.transaction accepts `any` to support both batch and callback forms,
      so TypeScript resolves to the batch overload and infers `any[]`. Cast is safe:
      the callback form always returns the callback's return type.
       */
      return await (prisma.transaction(
        async (tx: Prisma.TransactionClient): Promise<{ allowed: boolean; lockedUntil?: Date }> => {
          const existing = await tx.twoFactorRateLimit.findUnique({ where: { userId } });
          if (existing?.lockedUntil && existing.lockedUntil > new Date()) {
            return { allowed: false, lockedUntil: existing.lockedUntil };
          }

          const record = await tx.twoFactorRateLimit.upsert({
            where: { userId },
            update: { attempts: { increment: 1 } },
            create: { userId, attempts: 1 },
          });
          if (record.attempts >= MAX_ATTEMPTS) {
            const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
            await tx.twoFactorRateLimit.update({ where: { userId }, data: { lockedUntil } });
            return { allowed: true, lockedUntil };
          }
          return { allowed: true };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ) as unknown as Promise<{ allowed: boolean; lockedUntil?: Date }>);
    } catch (err: any) {
      // P2034: serialization conflict. P2002: concurrent first attempts racing the create.
      if (err.code === 'P2034' || err.code === 'P2002') {
        retries++;
        continue;
      }
      throw err;
    }
  }
  // Fail closed: under heavy contention, deny the attempt rather than check the code uncounted.
  return { allowed: false };
}

export async function resetRateLimit(userId: string): Promise<void> {
  await prisma.client.twoFactorRateLimit.deleteMany({ where: { userId } });
}
