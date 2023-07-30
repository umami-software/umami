import prisma from 'lib/prisma';

export async function getSession(id: string) {
  return prisma.client.session.findUnique({
    where: {
      id,
    },
  });
}
