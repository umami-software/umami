import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function getAccounts() {
  return runQuery(
    prisma.account.findMany({
      orderBy: [
        { is_admin: 'desc' },
        {
          username: 'asc',
        },
      ],
      select: {
        user_id: true,
        username: true,
        is_admin: true,
        created_at: true,
        updated_at: true,
      },
    }),
  );
}
