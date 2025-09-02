import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { pagingParams, searchParams } from '@/lib/schema';
import { canViewUsers } from '@/permissions';
import { getUsers } from '@/queries/prisma/user';

export async function GET(request: Request) {
  const schema = z.object({
    ...pagingParams,
    ...searchParams,
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
            websites: {
              where: { deletedAt: null },
            },
          },
        },
      },
      omit: {
        password: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
    query,
  );

  return json(users);
}
