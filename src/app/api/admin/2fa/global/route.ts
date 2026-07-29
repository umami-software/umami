import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canEnforceTwoFactorAuthForEveryone } from '@/permissions';

export async function POST(request: Request) {
  const schema = z.object({ required: z.boolean() });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  if (!(await canEnforceTwoFactorAuthForEveryone(auth))) {
    return unauthorized();
  }

  const { required } = body;

  await prisma.client.appSetting.upsert({
    where: { key: 'twoFactorRequiredGlobal' },
    update: { value: String(required) },
    create: { key: 'twoFactorRequiredGlobal', value: String(required) },
  });

  return json({ ok: true, required });
}
