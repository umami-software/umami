import prisma from 'lib/prisma';
import { Prisma } from '@prisma/client';

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  password?: string;
  createdAt?: Date;
}

export async function getUser(
  where: Prisma.UserWhereUniqueInput,
  includePassword = false,
): Promise<User> {
  return prisma.client.user.findUnique({
    where,
    select: {
      id: true,
      username: true,
      isAdmin: true,
      password: includePassword,
    },
  });
}
