import prisma from 'lib/prisma';

export async function createUser(data) {
  return prisma.client.user.create({
    data,
  });
}
