import { prisma, runQuery } from 'lib/db/relational';

export async function getAllWebsites() {
  let data = await runQuery(
    prisma.website.findMany({
      orderBy: [
        {
          user_id: 'asc',
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
    }),
  );
  return data.map(i => ({ ...i, account: i.account.username }));
}
