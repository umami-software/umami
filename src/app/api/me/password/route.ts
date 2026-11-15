import { z } from 'zod';
import { createSessionToken } from '@/lib/auth';
import { checkPassword, hashPassword } from '@/lib/password';
import redis from '@/lib/redis';
import { parseRequest } from '@/lib/request';
import { badRequest, json, notFound } from '@/lib/response';
import { getUser, updateUser } from '@/queries/prisma/user';

export async function POST(request: Request) {
  const schema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const userId = auth.user.id;
  const { currentPassword, newPassword } = body;

  const user = await getUser(userId, { includePassword: true });

  if (!user) {
    return notFound();
  }

  if (!checkPassword(currentPassword, user.password)) {
    return badRequest({ message: 'Current password is incorrect' });
  }

  const password = hashPassword(newPassword);

  const updated = await updateUser(userId, { password });

  // The new password invalidates every existing session, so keep this user signed in with a new one.
  const token = await createSessionToken({ id: userId, role: user.role, password });

  if (redis.enabled && auth.authKey) {
    await redis.client.del(auth.authKey);
  }

  return json({ ...updated, token });
}
