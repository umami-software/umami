import prisma from '@/lib/prisma';

/**
 * Atomically records a one-time password as used for the next 90 seconds. Returns false if it was
 * already used, so concurrent requests with the same code cannot both succeed.
 */
export async function claimOtp(userId: string, otp: string): Promise<boolean> {
  await prisma.client.twoFactorOtpUsed.deleteMany({
    where: { userId, otp, expiresAt: { lt: new Date() } },
  });

  try {
    await prisma.client.twoFactorOtpUsed.create({
      data: { userId, otp, expiresAt: new Date(Date.now() + 90 * 1000) },
    });
    return true;
  } catch (err: any) {
    // Unique (userId, otp) violation: another request already claimed this code.
    if (err?.code === 'P2002') {
      return false;
    }
    throw err;
  }
}
