import prisma from '@/lib/prisma';

/** Returns true when two-factor authentication is required globally, for the user, or by one of their teams. */
export async function isTwoFactorRequired(userId: string): Promise<boolean> {
  const globalSetting = await prisma.client.appSetting.findUnique({
    where: { key: 'twoFactorRequiredGlobal' },
  });

  if (globalSetting?.value === 'true') {
    return true;
  }

  const user = await prisma.client.user.findUnique({
    where: { id: userId },
    select: { twoFactorRequired: true },
  });

  if (user?.twoFactorRequired) {
    return true;
  }

  const team = await prisma.client.team.findFirst({
    where: { twoFactorRequired: true, members: { some: { userId } } },
    select: { id: true },
  });

  return !!team;
}
