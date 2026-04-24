import prisma from '@/lib/prisma';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

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

export async function recordFailedAttempt(userId: string): Promise<void> {
  const record = await prisma.client.twoFactorRateLimit.upsert({
    where: { userId },
    update: { attempts: { increment: 1 }, updatedAt: new Date() },
    create: { userId, attempts: 1, updatedAt: new Date() },
  });
  if (record.attempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    await prisma.client.twoFactorRateLimit.update({ where: { userId }, data: { lockedUntil } });
  }
}

export async function resetRateLimit(userId: string): Promise<void> {
  await prisma.client.twoFactorRateLimit.deleteMany({ where: { userId } });
}
