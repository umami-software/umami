import { Prisma } from '@prisma/client';
import prisma from 'lib/prisma';
import { User } from './getUser';

export async function updateUser(
  data: Prisma.UserUpdateArgs,
  where: Prisma.UserWhereUniqueInput,
): Promise<User> {
  return prisma.client.user.update({
    where,
    data,
    select: {
      id: true,
      username: true,
      isAdmin: true,
      createdAt: true,
    },
  });
}
