import prisma from 'lib/prisma';

export async function createUser(data: {
  id: string;
  username: string;
  password: string;
}): Promise<{
  id: string;
  username: string;
  isAdmin: boolean;
}> {
  return prisma.client.user.create({
    data,
    select: {
      id: true,
      username: true,
      isAdmin: true,
    },
  });
}
