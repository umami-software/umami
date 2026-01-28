import z from 'zod';
import { uuid } from '@/lib/crypto';
import { getRandomChars } from '@/lib/generate';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { anyObjectParam } from '@/lib/schema';
import { canUpdateEntity } from '@/permissions';
import { createShare } from '@/queries/prisma';

export async function POST(request: Request) {
  const schema = z.object({
    entityId: z.uuid(),
    shareType: z.coerce.number().int(),
    slug: z.string().max(100).optional(),
    parameters: anyObjectParam,
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { entityId, shareType, slug, parameters } = body;

  if (!(await canUpdateEntity(auth, entityId))) {
    return unauthorized();
  }

  const share = await createShare({
    id: uuid(),
    entityId,
    shareType,
    slug: slug || getRandomChars(16),
    parameters,
  });

  return json(share);
}
