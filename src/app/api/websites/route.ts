import { z } from 'zod';
import { canCreateTeamWebsite, canCreateWebsite } from '@/lib/auth';
import { json, unauthorized } from '@/lib/response';
import { uuid } from '@/lib/crypto';
import { parseRequest } from '@/lib/request';
import { createWebsite, getUserWebsites } from '@/queries';
import { pagingParams } from '@/lib/schema';

export async function GET(request: Request) {
  const schema = z.object({ ...pagingParams });

  const { auth, query, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const websites = await getUserWebsites(auth.user.id, query);

  return json(websites);
}

export async function POST(request: Request) {
  const schema = z.object({
    name: z.string().max(100),
    domain: z.string().max(500),
    shareId: z.string().max(50).nullable().optional(),
    teamId: z.string().nullable().optional(),
    id: z.string().uuid().nullable().optional(),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { id, name, domain, shareId, teamId } = body;

  if ((teamId && !(await canCreateTeamWebsite(auth, teamId))) || !(await canCreateWebsite(auth))) {
    return unauthorized();
  }

  const data: any = {
    id: id ?? uuid(),
    createdBy: auth.user.id,
    name,
    domain,
    shareId,
    teamId,
  };

  if (!teamId) {
    data.userId = auth.user.id;
  }

  const website = await createWebsite(data);

  return json(website);
}
