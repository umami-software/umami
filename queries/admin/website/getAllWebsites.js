import prisma from 'lib/prisma';

export async function getAllWebsites() {
  let data = await prisma.client.website.findMany({
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
  });

  return data.map(i => ({ ...i, user: i.user.username }));
}
