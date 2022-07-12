import { runQuery } from 'lib/queries';
import prisma from 'lib/db';

export async function updateAccount(user_id, data) {
  return runQuery(
    prisma.account.update({
      where: {
        user_id,
      },
      data,
    }),
  );
}
