import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json } from '@/lib/response';

export async function POST(request: Request) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const userId = auth.user.id;

  await prisma.client.twoFactorAuth.deleteMany({
    where: { userId, isEnabled: false },
  });

  return json({ ok: true });
}
