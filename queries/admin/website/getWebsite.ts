import prisma from 'lib/prisma';
import { Prisma, Website } from '@prisma/client';

export async function getWebsite(where: Prisma.WebsiteWhereUniqueInput): Promise<Website> {
  return prisma.client.website.findUnique({
    where,
  });
}
