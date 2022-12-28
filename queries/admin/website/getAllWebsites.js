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
      account: {
        select: {
          username: true,
        },
      },
    },
  });

  return data.map(i => ({ ...i, account: i.account.username }));
}
