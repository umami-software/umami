import { z } from 'zod';
import { auth as betterAuth } from '@/lib/auth-server';
import { parseRequest } from '@/lib/request';
import { badRequest, json } from '@/lib/response';
import { getUser } from '@/queries/prisma/user';

export async function POST(request: Request) {
  const schema = z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { currentPassword, newPassword } = body;

  try {
    await betterAuth.api.changePassword({
      headers: request.headers,
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
    });
  } catch {
    return badRequest({ message: 'Current password is incorrect' });
  }

  return json(await getUser(auth.user.id));
}
