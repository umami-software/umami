import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { updateUser } from '@/queries/prisma/user';
import { canEnforceTwoFactorAuthForUser } from '@/permissions';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  if (!(await canEnforceTwoFactorAuthForUser(auth))) {
    return unauthorized();
  }

  const { userId } = await params;

  const twoFactor = await prisma.client.twoFactorAuth.findUnique({ where: { userId } });

  return json({ isEnabled: twoFactor?.isEnabled ?? false });
}

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const schema = z.object({ required: z.boolean() });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canEnforceTwoFactorAuthForUser(auth))) {
    return unauthorized();
  }

  const { userId } = await params;
  const { required } = body;

  const user = await updateUser(userId, { twoFactorRequired: required });

  return json({ ok: true, userId: user.id, twoFactorRequired: required });
}
