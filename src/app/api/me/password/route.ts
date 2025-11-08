import { z } from 'zod';
import { checkPassword, hashPassword } from '@/lib/password';
import { parseRequest } from '@/lib/request';
import { json, badRequest } from '@/lib/response';
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

  if (!checkPassword(currentPassword, user.password)) {
    return badRequest({ message: 'Current password is incorrect' });
  }

  const password = hashPassword(newPassword);

  const updated = await updateUser(userId, { password });

  return json(updated);
}
