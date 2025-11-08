import { z } from 'zod';
import { hashPassword } from '@/lib/password';
import { canCreateUser } from '@/permissions';
import { ROLES } from '@/lib/constants';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { unauthorized, json, badRequest } from '@/lib/response';
import { createUser, getUserByUsername } from '@/queries/prisma';

export async function POST(request: Request) {
  const schema = z.object({
    id: z.uuid().optional(),
    username: z.string().max(255),
    password: z.string(),
    role: z.string().regex(/admin|user|view-only/i),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canCreateUser(auth))) {
    return unauthorized();
  }

  const { id, username, password, role } = body;

  const existingUser = await getUserByUsername(username, { showDeleted: true });

  if (existingUser) {
    return badRequest({ message: 'User already exists' });
  }

  const user = await createUser({
    id: id || uuid(),
    username,
    password: hashPassword(password),
    role: role ?? ROLES.user,
  });

  return json(user);
}
