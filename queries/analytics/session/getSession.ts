import { Prisma } from '@prisma/client';
import prisma from 'lib/prisma';

export async function getSession(where: Prisma.SessionWhereUniqueInput) {
  return prisma.client.session.findUnique({
    where,
  });
}
