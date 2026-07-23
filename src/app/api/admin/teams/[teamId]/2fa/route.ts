import { z } from 'zod';
import prisma from '@/lib/prisma';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canEnforceTwoFactorAuthForTeam } from '@/permissions';

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({ required: z.boolean() });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canEnforceTwoFactorAuthForTeam(auth, teamId))) {
    return unauthorized();
  }
  const { required } = body;

  await prisma.client.team.update({
    where: { id: teamId },
    data: { twoFactorRequired: required },
  });

  return json({ ok: true, teamId, twoFactorRequired: required });
}
