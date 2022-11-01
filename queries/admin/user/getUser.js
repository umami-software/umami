import prisma from 'lib/prisma';

export async function getUser(where) {
  return prisma.client.user.findUnique({
    where,
  });
}
