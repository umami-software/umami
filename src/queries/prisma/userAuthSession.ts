import { Prisma } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export async function findUserAuthSession(criteria: Prisma.UserAuthSessionFindUniqueArgs) {
  return prisma.client.userAuthSession.findUnique(criteria);
}

export async function getUserAuthSessionByRefreshHash(refreshHash: string) {
  return findUserAuthSession({
    where: {
      refreshHash,
    },
  });
}

export async function updateUserAuthSession(
  userAuthSessionId: string,
  data: Prisma.UserAuthSessionUpdateInput,
) {
  return prisma.client.userAuthSession.update({
    where: {
      id: userAuthSessionId,
    },
    data,
  });
}
