import { z } from 'zod';
import { hashPassword } from 'next-basics';
import { canCreateUser, checkAuth } from 'lib/auth';
import { ROLES } from 'lib/constants';
import { uuid } from 'lib/crypto';
import { checkRequest } from 'lib/request';
import { unauthorized, json, badRequest } from 'lib/response';
import { createUser, getUserByUsername } from 'queries';

export async function POST(request: Request) {
  const schema = z.object({
    username: z.string().max(255),
    password: z.string(),
    id: z.string().uuid(),
    role: z.string().regex(/admin|user|view-only/i),
  });

  const { body, error } = await checkRequest(request, schema);

  if (error) {
    return badRequest(error);
  }

  const auth = await checkAuth(request);

  if (!auth || !(await canCreateUser(auth))) {
    return unauthorized();
  }

  const { username, password, role, id } = body;

  const existingUser = await getUserByUsername(username, { showDeleted: true });

  if (existingUser) {
    return badRequest('User already exists');
  }

  const user = await createUser({
    id: id || uuid(),
    username,
    password: hashPassword(password),
    role: role ?? ROLES.user,
  });

  return json(user);
}
