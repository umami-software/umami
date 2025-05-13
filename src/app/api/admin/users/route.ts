import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams } from '@/lib/schema';
import { canViewUsers } from '@/lib/auth';
import { getUsers } from '@/queries/prisma/user';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
  });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canViewUsers(auth))) {
    return unauthorized();
  }

  const users = await getUsers(
    {
      include: {
        _count: {
          select: {
            websiteUser: {
              where: { deletedAt: null },
            },
          },
        },
      },
    },
    query,
  );

  return json(users);
}
