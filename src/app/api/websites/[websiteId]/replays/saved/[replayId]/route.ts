import { z } from 'zod';
import { parseRequest } from '@/lib/request';
import { json, unauthorized } from '@/lib/response';
import { canUpdateWebsite, canViewWebsite } from '@/permissions';
import {
  createReplaySaved,
  deleteReplaySaved,
  getReplaySaved,
} from '@/queries/prisma/sessionReplay';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; replayId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, replayId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const isSaved = await getReplaySaved(websiteId, replayId);

  return json({ isSaved });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; replayId: string }> },
) {
  const schema = z.object({
    isSaved: z.boolean(),
    name: z.string().max(100).optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { websiteId, replayId } = await params;

  if (!(await canUpdateWebsite(auth, websiteId))) {
    return unauthorized();
  }

  if (body.isSaved) {
    await createReplaySaved(websiteId, replayId, body.name ?? '');
  } else {
    await deleteReplaySaved(websiteId, replayId);
  }

  return json({ ok: true });
}
