import prisma from 'lib/prisma';
import { User } from './getUser';

export async function getUsers(): Promise<User[]> {
  return prisma.client.user.findMany({
    orderBy: [
      { isAdmin: 'desc' },
      {
        username: 'asc',
      },
    ],
    select: {
      id: true,
      username: true,
      isAdmin: true,
      createdAt: true,
    },
  });
}
