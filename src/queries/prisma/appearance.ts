import prisma from '@/lib/prisma';

export async function getUserAppearance(userId: string) {
  return prisma.client.userAppearance.findUnique({ where: { userId } });
}

export async function saveUserAppearance(userId: string, settings: object) {
  return prisma.client.userAppearance.upsert({
    where: { userId },
    create: { userId, settings },
    update: { settings },
  });
}

export async function deleteUserAppearance(userId: string) {
  return prisma.client.userAppearance.deleteMany({ where: { userId } });
}
