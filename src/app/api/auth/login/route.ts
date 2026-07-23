import { z } from 'zod';
import { createAuthResponse } from '@/lib/auth-response';
import { checkPassword } from '@/lib/password';
import { isPasswordAuthDisabled } from '@/lib/password-auth';
import { parseRequest } from '@/lib/request';
import { noStoreJson, unauthorized } from '@/lib/response';
import { getUserByUsername } from '@/queries/prisma';

export async function POST(request: Request) {
  if (isPasswordAuthDisabled()) {
    return unauthorized();
  }

  const schema = z.object({
    username: z.string(),
    password: z.string(),
  });

  const { body, error } = await parseRequest(request, schema, { skipAuth: true });

  if (error) {
    return error();
  }

  const { username, password } = body;

  const user = await getUserByUsername(username, { includePassword: true });

  if (!user || !checkPassword(password, user.password)) {
    return unauthorized({ code: 'incorrect-username-password' });
  }

  return noStoreJson(await createAuthResponse(user));
}
