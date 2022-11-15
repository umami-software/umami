import { Website } from '@prisma/client';
import prisma from 'lib/prisma';

export async function getAllWebsites(): Promise<(Website & { user: string })[]> {
  return await prisma.client.website
    .findMany({
      orderBy: [
        {
          userId: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    })
    .then(data => data.map(i => ({ ...i, user: i.user.username })));
}
