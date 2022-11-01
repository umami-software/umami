import prisma from 'lib/prisma';

export async function updateUser(data, where) {
  return prisma.client.user.update({
    where,
    data,
  });
}
